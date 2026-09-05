ATLAS — FIX HARDCODED ALGERIA WILAYA + COMMUNE DATA

IMPORTANT:
The Wilaya/Commune list used by the Atlas checkout is currently
HARDCODED IN THE SITE CODE.

It is NOT stored in Prisma.
It is NOT stored in PostgreSQL.
It is NOT a database table.

DO NOT modify Prisma.
DO NOT modify PostgreSQL.
DO NOT create database tables.
DO NOT create a second database.
DO NOT change the Admin Dashboard backend.

This task is ONLY about correcting the hardcoded Algeria
Wilaya + Commune dataset used by the Atlas storefront checkout.

============================================================
1. FIND THE CURRENT HARDCODED DATA
============================================================

Search the entire Atlas site codebase for the current hardcoded:

- Wilaya list
- Wilaya codes
- Wilaya names
- Arabic Wilaya names
- Commune list
- Wilaya → Commune mappings

Look for files such as:

- checkout components
- checkout forms
- constants
- data files
- JSON files
- TypeScript/JavaScript constants
- shipping configuration
- address components
- Algeria location datasets

Do NOT assume the filename.

Search the actual codebase first.

============================================================
2. REPLACE THE INCORRECT DATA
============================================================

The current dataset is incorrect/outdated.

Replace the old Wilaya numbering with the CURRENT 2026
Algerian administrative structure.

Algeria currently has:

69 WILAYAS
1541 COMMUNES

The final Wilaya codes must be 01 through 69.

============================================================
3. CRITICAL WILAYA CODES 57–69
============================================================

Make absolutely sure these mappings are correct:

57 — El Meghaier — المغير
58 — El Meniaâ — المنيعة
59 — Aflou — أفلو
60 — Barika — بريكة
61 — El Kantara — القنطرة
62 — Bir El Ater — بئر العاتر
63 — El Aricha — العريشة
64 — Ksar Chellala — قصر الشلالة
65 — Aïn Ouessara — عين وسارة
66 — Messaad — مسعد
67 — Ksar El Boukhari — قصر البخاري
68 — Bou Saâda — بوسعادة
69 — El Abiodh Sidi Cheikh — الأبيض سيدي الشيخ

DO NOT use the old incorrect mappings.

For example:

57 MUST NOT be In Salah.
58 MUST NOT be In Guezzam.
61 MUST NOT be Ksar Chellala.
62 MUST NOT be Aïn Ouessara.
63 MUST NOT be Messaad.
64 MUST NOT be Bou Saâda.
65 MUST NOT be El Abiodh Sidi Cheikh.
66 MUST NOT be El Eulma.
67 MUST NOT be Djamaa.
68 MUST NOT be Maghnia.
69 MUST NOT be Debila.

============================================================
4. VERIFY ALL 69 WILAYAS
============================================================

Do not only fix the visible 57–69 section.

Verify the entire hardcoded dataset.

It must contain:

01
02
03
04
05
06
07
08
09
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69

There must be:

- no duplicate codes
- no missing codes
- no commune accidentally listed as a Wilaya
- no outdated 58-Wilaya dataset
- no duplicate Wilaya names

============================================================
5. COMMUNES
============================================================

The Commune data is also hardcoded.

Fix the Commune dataset as well.

The current administrative structure contains:

1541 communes.

Do not only fix the Wilaya names.

Every Commune must belong to the correct Wilaya.

The structure should remain something equivalent to:

Wilaya
  ↓
Communes belonging to that Wilaya

For example:

When the user selects:

68 — Bou Saâda

the Commune dropdown must only display communes belonging
to Wilaya 68.

============================================================
6. DYNAMIC COMMUNE DROPDOWN
============================================================

Keep the existing checkout UI.

Do not redesign the form.

The behavior should be:

No Wilaya selected:

Wilaya:
[ Select Wilaya ]

Commune:
[ Select Wilaya first ]

After selecting a Wilaya:

Wilaya:
68 — Bou Saâda (بوسعادة)

Commune:
[ Select Commune ]

Only communes belonging to Wilaya 68 appear.

When the user changes the Wilaya:

clear the previously selected Commune.

Then load/filter the communes belonging to the newly selected
Wilaya.

============================================================
7. DO NOT USE A GLOBAL COMMUNE LIST WITHOUT FILTERING
============================================================

Do not allow the user to select an arbitrary Commune independently
of the Wilaya.

The relationship must be enforced in the application code.

Example:

wilaya = 68
commune = valid commune belonging to 68

→ valid

wilaya = 68
commune = commune belonging to Algiers

→ invalid

============================================================
8. KEEP THE DATA HARDcoded
============================================================

The Wilaya + Commune dataset should remain a code-level/static
dataset because this is how the current Atlas checkout is designed.

You may improve its organization if necessary.

For example, you may use:

/data/algeriaLocations.ts

or:

/constants/algeriaLocations.ts

or another appropriate existing project location.

But DO NOT move it into Prisma/PostgreSQL.

DO NOT create API endpoints just for this data unless the
existing architecture genuinely requires it.

A static local dataset is completely acceptable here.

============================================================
9. DO NOT TOUCH PRISMA / DATABASE
============================================================

This task does NOT require:

- Prisma migrations
- Prisma schema changes
- PostgreSQL changes
- database migrations
- database seed changes
- new database tables
- new database relationships

Leave the existing database architecture untouched.

Products, orders, customers, inventory, authentication, etc.
must continue working exactly as they do now.

============================================================
10. DO NOT TOUCH THE ADMIN BACKEND
============================================================

The existing Admin Dashboard is already working.

Do not rebuild it.

Do not migrate the Wilaya data into the Admin Dashboard database.

Do not introduce another backend.

This task concerns the hardcoded location data used by the
Atlas storefront checkout.

============================================================
11. SHIPPING FEES
============================================================

IMPORTANT:

If delivery/shipping fees are also hardcoded by Wilaya code,
inspect them.

After correcting the Wilaya numbering, make sure shipping fees
still correspond to the correct Wilaya.

Do not accidentally shift shipping fees because Wilaya codes
changed.

If the existing shipping configuration uses the same codes,
update it consistently.

============================================================
12. ORDER SUBMISSION
============================================================

Keep the existing order submission system.

Do not rebuild the order backend.

The checkout should continue submitting the selected:

- Wilaya
- Commune
- address
- phone
- customer information

exactly as it currently does.

Only correct the location data and validation.

If the existing backend validates Wilaya/Commune values, preserve
that functionality.

If there is no validation because the data is currently just
hardcoded frontend data, do not create an unnecessary new backend
system.

============================================================
13. SEARCH THE ENTIRE CODEBASE
============================================================

After making the change, search the entire project for the old
Wilaya dataset.

Look for:

- old Wilaya arrays
- old Commune arrays
- old 58-Wilaya lists
- old Wilaya numbering
- duplicate location constants
- old shipping mappings

Do not leave an old conflicting dataset somewhere else.

There should be ONE authoritative hardcoded Algeria location
dataset used by the checkout.

============================================================
14. DO NOT CHANGE ATLAS DESIGN
============================================================

Do not redesign:

- checkout
- header
- product page
- cart
- buttons
- colors
- typography
- logo
- Atlas branding

Only fix the Wilaya/Commune data and its behavior.

============================================================
15. FINAL VALIDATION
============================================================

Before finishing, verify:

✓ 69 Wilayas exist
✓ Wilaya codes are 01–69
✓ No duplicate Wilaya codes
✓ No missing Wilaya codes
✓ 1541 communes are represented
✓ Every Commune belongs to the correct Wilaya
✓ Wilaya selection filters Commune selection
✓ Changing Wilaya resets Commune
✓ Invalid Wilaya/Commune combinations cannot be selected
✓ 57 = El Meghaier
✓ 58 = El Meniaâ
✓ 59 = Aflou
✓ 60 = Barika
✓ 61 = El Kantara
✓ 62 = Bir El Ater
✓ 63 = El Aricha
✓ 64 = Ksar Chellala
✓ 65 = Aïn Ouessara
✓ 66 = Messaad
✓ 67 = Ksar El Boukhari
✓ 68 = Bou Saâda
✓ 69 = El Abiodh Sidi Cheikh

Most importantly:

DO NOT TOUCH PRISMA.
DO NOT TOUCH POSTGRESQL.
DO NOT REBUILD THE ADMIN BACKEND.
DO NOT CREATE A NEW DATABASE.

Fix the existing HARDCODED location dataset in the Atlas
storefront code and make the checkout use the corrected
69-Wilaya / 1541-Commune structure.