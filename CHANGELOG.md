## [1.7.0](https://github.com/sdavisde/dttd/compare/v1.6.0...v1.7.0) (2026-01-23)

### Features

- add back pending approval status ([c9adf88](https://github.com/sdavisde/dttd/commit/c9adf883023d2143be5c1c04823d0a01aced6b0c))

## [1.6.0](https://github.com/sdavisde/dttd/compare/v1.5.0...v1.6.0) (2026-01-23)

### Features

- add inline editable form for candidate details ([64d5c35](https://github.com/sdavisde/dttd/commit/64d5c355222440b18accee1cfad692235ebadc3e))
- add pencil icon for better UX on the editable inline fields ([6ce1b63](https://github.com/sdavisde/dttd/commit/6ce1b63a2c03f86c7937bdab75054d8a44fa5c69))

### Bug Fixes

- add date picker field ([551a564](https://github.com/sdavisde/dttd/commit/551a56412f5ac514737b1dd066d7f22e5e1b2891))
- add number and boolean inline fields ([a63afab](https://github.com/sdavisde/dttd/commit/a63afabe1b0c29ed070314afd1793e9f0de5269b))

## [1.5.0](https://github.com/sdavisde/dttd/compare/v1.4.0...v1.5.0) (2026-01-23)

### Features

- add candidate payments to table ([b247450](https://github.com/sdavisde/dttd/commit/b247450ffd541f0687e3bc077f5bd35487794040))

## [1.4.0](https://github.com/sdavisde/dttd/compare/v1.3.0...v1.4.0) (2026-01-23)

### Features

- Integrate Sentry for better error aggregation ([20ef2be](https://github.com/sdavisde/dttd/commit/20ef2be2e1f1de4a202b929421ade9a35a5fa26e))

## [1.3.0](https://github.com/sdavisde/dttd/compare/v1.2.0...v1.3.0) (2026-01-21)

### Features

- add error catching pages ([0fbfabc](https://github.com/sdavisde/dttd/commit/0fbfabcee58c859eafd0096a6217908ee1e0e1e2))
- add specific candidate page to replace the candidate sheet ([6de87b2](https://github.com/sdavisde/dttd/commit/6de87b2e92bf66fd402213a9ef9a4b314eca7f87))
- add test candidate info ([cf81a81](https://github.com/sdavisde/dttd/commit/cf81a819f59dfa6c5c04c71640bfd16580cbff79))
- enable analytics ([99818e3](https://github.com/sdavisde/dttd/commit/99818e3de944ee803a473f3044cf61d1e779330e))

### Bug Fixes

- fix build error ([96618f4](https://github.com/sdavisde/dttd/commit/96618f418255e9086b170e93a716ea3e20cf0a8e))

## [1.2.0](https://github.com/sdavisde/dttd/compare/v1.1.0...v1.2.0) (2026-01-20)

### Features

- add Stripe webhook listener task for local development ([69349a8](https://github.com/sdavisde/dttd/commit/69349a826016a7f7f46c832e3730d2f9b0ce9d80))
- add yarn install step to setup task ([1c316c3](https://github.com/sdavisde/dttd/commit/1c316c37c82b19da5e760782ea2852f030d7c6e7))
- automate Supabase local key population in setup task ([deb8c42](https://github.com/sdavisde/dttd/commit/deb8c4253cfcad1cad1f2b40bcc5461d911f8fad))
- integrate Infisical for secret management ([cdb8261](https://github.com/sdavisde/dttd/commit/cdb82616366ca38bfb3445368dbc2314448a6ae7))

### Bug Fixes

- add Infisical path for Development folder ([ff7c6d6](https://github.com/sdavisde/dttd/commit/ff7c6d63a5e05f9f84efb033d5899f9405add1f5))
- improve Infisical auth check and secret pulling ([87deaa5](https://github.com/sdavisde/dttd/commit/87deaa565b903123858ed8fbb0c2833e223477e6))
- update README with better description ([0c8f8b6](https://github.com/sdavisde/dttd/commit/0c8f8b6d895c1edf6efc4e2b040bd23863be03de))

## [1.1.0](https://github.com/sdavisde/dttd/compare/v1.0.0...v1.1.0) (2026-01-20)

### Features

- create Taskfile foundation with prerequisite checking ([b008155](https://github.com/sdavisde/dttd/commit/b008155a5dc21b55e84868fb21028344a0fc1955))

### Bug Fixes

- Remove READ_MASTER_ROSTER permission ([1cecb42](https://github.com/sdavisde/dttd/commit/1cecb42308ac0e4ee66c18c06a058c1d8377ddd0))
- use POSIX-compatible shell syntax in Taskfile ([27c07ea](https://github.com/sdavisde/dttd/commit/27c07ea11eb5d319109fab4ddc21986c037e6a38))

## 1.0.0 (2026-01-18)

### ⚠ BREAKING CHANGES

- Add supabase migration script and config

### Features

- add action to fetch weekend team experience distribution ([60a5a39](https://github.com/sdavisde/dttd/commit/60a5a397cb51b0ae1c027ab992c514e6d53b4026))
- add address to team forms ([a61c81a](https://github.com/sdavisde/dttd/commit/a61c81a71fde4f00019cc8f0bcc7cfa03014ae8f))
- add address to user table ([5f283d4](https://github.com/sdavisde/dttd/commit/5f283d43bf7b7ba2e6a212eefc58107ffe9f9a46))
- add community service for the encouragement logic ([1353568](https://github.com/sdavisde/dttd/commit/13535682f53cfb613db55a73553ca7853fbb95c5))
- add delete candidate confirm modal ([04463d7](https://github.com/sdavisde/dttd/commit/04463d767687612c434281c3b44247223489bb79))
- add enhanced details to user sheet in master roster ([55f791a](https://github.com/sdavisde/dttd/commit/55f791aaafd4ca652877fb3096b3f2ae321fb640))
- add experience chart to the roster page ([9341c0d](https://github.com/sdavisde/dttd/commit/9341c0dc7cbdd5fe74daead3831044083582553e))
- add features to candidate table like additional statuses and filtering ([b8afc66](https://github.com/sdavisde/dttd/commit/b8afc66b9e5d6a00e8d0c6bae60502dbece1082c))
- add impersonation dialog for FULL_ACCESS users ([0ea16ac](https://github.com/sdavisde/dttd/commit/0ea16ac1e3a9d7a2ff43c39fdd3a08759a205a6c))
- add impersonation service ([54f730b](https://github.com/sdavisde/dttd/commit/54f730b94a0dd4f86f779c08fb6a1bfca7444c74))
- add logic to save and load addresses for users ([ddbb729](https://github.com/sdavisde/dttd/commit/ddbb7295c24660d85ba37dddffc057281b994955))
- add medical info to team forms ([c4f9693](https://github.com/sdavisde/dttd/commit/c4f9693be2cffc592216bded2bc2361e75ce3476))
- add medical info to team roster ([67e865a](https://github.com/sdavisde/dttd/commit/67e865a637070454edc26cb8fe443da99d0d9a0d))
- add new colors for roster experience level ([5e2c93e](https://github.com/sdavisde/dttd/commit/5e2c93e629072657cd69647aa2c5a94100706442))
- add new lint rules to prevent returning Error from server action ([2821dc9](https://github.com/sdavisde/dttd/commit/2821dc9d0c85378f1d866a04cb94c3d28193fdf0))
- add new permission for community encouragement ([4523641](https://github.com/sdavisde/dttd/commit/4523641c069b347239366a4495c76e2f5a3bdc37))
- add null coalescing checks ([3a0009e](https://github.com/sdavisde/dttd/commit/3a0009e1304b78f06acb0ee9e56f042f40d46c74))
- add pointer styling to actions ([29b5c30](https://github.com/sdavisde/dttd/commit/29b5c308282459e63c84757244115a7bc46c55a5))
- add second form page ([e3e64d4](https://github.com/sdavisde/dttd/commit/e3e64d443245151b1fedf80bd829c794e762c9e7))
- add send candidate forms confirmation email ([983fe2c](https://github.com/sdavisde/dttd/commit/983fe2cefb5df8b5899eb6319936256f63b58c54))
- Add supabase migration script and config ([86bb027](https://github.com/sdavisde/dttd/commit/86bb0279b35bd3d1ede8ed5e0b65079dfaaf33b1))
- add team forms check to the roster page ([2102d59](https://github.com/sdavisde/dttd/commit/2102d592e37171c02e2b7c954fd6ef11c0ce813a))
- add third team form for release of claim ([67ff853](https://github.com/sdavisde/dttd/commit/67ff853aad14ab48c0646932888bc6fb0f3d5580))
- add useful columns to the master roster ([646eaca](https://github.com/sdavisde/dttd/commit/646eaca0ad31d52c0cd868c47e67bfe6397ebc7c))
- add user experience server actions to get user service history ([6fa5749](https://github.com/sdavisde/dttd/commit/6fa57491f1109a3a0358b14bdbdd6b3e7bf077ab))
- add weekend status badge ([69e30a7](https://github.com/sdavisde/dttd/commit/69e30a78daf0810904709969c17d333f131ed7ad))
- allow job desciptions todo to be saved in local storage ([307a07b](https://github.com/sdavisde/dttd/commit/307a07bf59c283b9927e9f11d50d3e690d73acf3))
- allow payment owner to be updated when reviewing candidate details ([303a9d6](https://github.com/sdavisde/dttd/commit/303a9d623c5eede82581c4046b1959877ea2eb67))
- allow rejecting candidates ([2a51fb8](https://github.com/sdavisde/dttd/commit/2a51fb8ed19aca7fc5cbfd4e0ba52c3c067bc36d))
- allow users to have multiple roles ([da5ad9b](https://github.com/sdavisde/dttd/commit/da5ad9bd4938e03a42b91210a7d30ef428f54abd))
- complete team info todo ([8def250](https://github.com/sdavisde/dttd/commit/8def250219a2cf9ebac5e7a9dc6ffc442ebda1f4))
- differentiate rector ready from previous rectors ([4aa384f](https://github.com/sdavisde/dttd/commit/4aa384f7c2c57e5c947c57d5d893a0357159a2c0))
- filter candidates list to only include candidates from a specific weekend ([e27c8c6](https://github.com/sdavisde/dttd/commit/e27c8c603814736cae417493aa559f3a646771fc))
- finish up community encouragement editor ([356451f](https://github.com/sdavisde/dttd/commit/356451f370233cdd151d58a75ca6dccf0c54a29d))
- implement "send forms" action for candidates ([b7abcae](https://github.com/sdavisde/dttd/commit/b7abcae8589fc04075ef7927c58cd5681db5bf47))
- initialize master roster service ([a2df1de](https://github.com/sdavisde/dttd/commit/a2df1de5bc19965b2c99d7906f1cf5fb7987c404))
- introduce authorized actions helper ([07a445b](https://github.com/sdavisde/dttd/commit/07a445b8f8384658211f6199467e5c6df9413762))
- introduce basic info and experience sections ([0af8e54](https://github.com/sdavisde/dttd/commit/0af8e540ee513be7f05a07d810df9601cd9eb1c5))
- introduce better date picker for team forms ([ff061f0](https://github.com/sdavisde/dttd/commit/ff061f081b48242c85006186b4f0b5323fff2eee))
- introduce camp waiver form ([9111d1f](https://github.com/sdavisde/dttd/commit/9111d1f480c25f12cfd9921c63d2ac939428f308))
- introduce empty state for candidates list + hide status legend unless hovered ([b92298f](https://github.com/sdavisde/dttd/commit/b92298f7cf07c8f6fc0207525d83fb37751ff576))
- introduce eslint config ([8ab8455](https://github.com/sdavisde/dttd/commit/8ab8455914bd579812138a8e66877e34e773fd3f))
- introduce new service pattern for users ([cdeb5a4](https://github.com/sdavisde/dttd/commit/cdeb5a420456abf572a9c710ad99ec52d9b7efd5))
- introduce send payment request email modal ([135b831](https://github.com/sdavisde/dttd/commit/135b8314744c8ea559c743afb9f465e39004fd8b))
- introduce skills section to forms ([a7d440a](https://github.com/sdavisde/dttd/commit/a7d440a7ffb2db1938b1f33d1bbbacd7b03d81ed))
- introduce statement of belief form ([35e9c43](https://github.com/sdavisde/dttd/commit/35e9c4317f8ee86b8cf06c31b92a88135100063e))
- introduce stepper to team forms ([3b5c135](https://github.com/sdavisde/dttd/commit/3b5c1355e250e0425f4faad4e614d8a86f827971))
- introduce team forms breakdown page ([ef40881](https://github.com/sdavisde/dttd/commit/ef40881db3dfefcabc73e2b0c2bc2ee7d489a211))
- introduce todo section for team members on homepage ([7668784](https://github.com/sdavisde/dttd/commit/76687840b0aa275ec16d20d473855c13ebea259d))
- introduce type guard to help with finding team member info ([298d4d3](https://github.com/sdavisde/dttd/commit/298d4d32521e410e0950f5528f0e90475a649ef6))
- introduce types and helpers to support rendering user experience ([b02dae3](https://github.com/sdavisde/dttd/commit/b02dae38d642b6e7714df455052c83966572082f))
- mark payment step as completed when user has payment record for team fees ([d2170a9](https://github.com/sdavisde/dttd/commit/d2170a9ba84f17a5cf68a1045b8afcde7a91c23c))
- read in user experience when loading info sheet ([1897a05](https://github.com/sdavisde/dttd/commit/1897a05f4d608142ca06875d6ec16f400c6c774c))
- update db types ([0468d8d](https://github.com/sdavisde/dttd/commit/0468d8d949ecf924076be6df89f4bc1239ff70a3))

### Bug Fixes

- add apos; to fix linter errs ([3400555](https://github.com/sdavisde/dttd/commit/3400555da813106a9ac5f043e100971bab44ea74))
- add logging and redirect when candidate info not found on fee page ([fbf3f19](https://github.com/sdavisde/dttd/commit/fbf3f19f78ed9a1ec17ffafde4ca4d2ac3e0046c))
- add other release packages ([e189c05](https://github.com/sdavisde/dttd/commit/e189c050313bd9e7914107f2e098d67ac0bad149))
- add readonly mode to roles page ([c6020d9](https://github.com/sdavisde/dttd/commit/c6020d9c0a898b1eb8fe10ff39ca582c3d48ee6e))
- add semantic-release ([dcfb307](https://github.com/sdavisde/dttd/commit/dcfb307616b4f76633aa7ab3387f4b20b548a90e))
- add weekend title to cards ([b3e5c36](https://github.com/sdavisde/dttd/commit/b3e5c364cebe1ade84f019141f0641581f7be004))
- allow both genders on team roster dropdown ([938f314](https://github.com/sdavisde/dttd/commit/938f3142ff3c275b6f3abfc87873d4a6c112bac4))
- allow entering dates in the future for events ([52fee87](https://github.com/sdavisde/dttd/commit/52fee878b034bb8bc029ebe8eab2edd617f235b8))
- allow large files + add weekend_Id to sponsor form ([79dd65d](https://github.com/sdavisde/dttd/commit/79dd65dbb0d3028f692c16f5074827f0e230a820))
- allow READ_CANDIDATES to view candidates page ([4ef1637](https://github.com/sdavisde/dttd/commit/4ef1637f69d4654f9b5d4a32666846765c4adda5))
- allow team info sheet completion to be saved ([c0995ea](https://github.com/sdavisde/dttd/commit/c0995ea290181d141cb8ccaac3112633679902c5))
- broken import ([704b8e2](https://github.com/sdavisde/dttd/commit/704b8e2eff6da7aa6b719a461956b110aa78651c))
- broken imports after user service consolidation ([f83b88e](https://github.com/sdavisde/dttd/commit/f83b88e280294a80327cf5e68ac1f647474e3fde))
- bug when submitting team forms ([e489f75](https://github.com/sdavisde/dttd/commit/e489f753d4c1b3b9fc704edf1da86a04f6046ffb))
- build and separate weekend cards ([2b73ee9](https://github.com/sdavisde/dttd/commit/2b73ee990a5f5b6ed090a865bad101e67b334be1))
- build error around users action ([92153b6](https://github.com/sdavisde/dttd/commit/92153b645f5d3e46b590f6ed140925b0d7c879b1))
- build errors in py files ([cb41cb8](https://github.com/sdavisde/dttd/commit/cb41cb896f3450edaf376e1dfed257f94508dcb1))
- cleanup remaining low effort lint errs ([c0ee053](https://github.com/sdavisde/dttd/commit/c0ee0533a345b89cf3ef16c4173f3cf8d8dba1db))
- disable only steps that are past the first step that needs to be completed ([fb44bef](https://github.com/sdavisde/dttd/commit/fb44befb44c6317b5a7e4c7e1249d80342645055))
- dramatically improve UI of stepper ([b73d1cf](https://github.com/sdavisde/dttd/commit/b73d1cfe94b5efeea88cf5304beeca91556b6145))
- filter out medical conditions answers like "n/a, none, no" from ([0160639](https://github.com/sdavisde/dttd/commit/0160639d8fd13b8ca2fb8131efbdcea6ef5997a3))
- fix bug when adding experience ([e60ab12](https://github.com/sdavisde/dttd/commit/e60ab1291d29b3fcf18730b05548864bd3b7a0f0))
- fix build error ([deb791c](https://github.com/sdavisde/dttd/commit/deb791cb34051ed0aa1f11a05f1518ea6f4adf4a))
- fix build errors ([6b0f842](https://github.com/sdavisde/dttd/commit/6b0f842356cebb8d1113fda28a0835ee4786170f))
- fix candidate fee UX ([c3c1d28](https://github.com/sdavisde/dttd/commit/c3c1d286dde41b481c656ca5ceeab11642e12ec7))
- fix client side user data not refreshing when impersonating ([51f8ea5](https://github.com/sdavisde/dttd/commit/51f8ea52e17111ecbe06f562b34c8a8324a946a4))
- fix date picker to require range passed in ([8fddd7f](https://github.com/sdavisde/dttd/commit/8fddd7f88425e5768c9b19bafd1af4acd1d351d0))
- fix datetime ([d57deac](https://github.com/sdavisde/dttd/commit/d57deacc74b28dfe9257bf210c4a3fdcc7bd3c96))
- fix error when submitting forms ([66503dd](https://github.com/sdavisde/dttd/commit/66503ddbb513082a34df933ff403e53c9c273b2d))
- fix infinite load ([9a96db0](https://github.com/sdavisde/dttd/commit/9a96db0d81d0032c790c0284a58e6ad4fc1c5089))
- fix linting errors in component library ([b4fecf6](https://github.com/sdavisde/dttd/commit/b4fecf6548a6121634cc058c7459a5f41b819e7a))
- fix prop serialization ([6e579ce](https://github.com/sdavisde/dttd/commit/6e579cec88969a36a2e40584c11eb0337c635995))
- fix style for user experience field ([6a0acd1](https://github.com/sdavisde/dttd/commit/6a0acd13bdd628d5af903b5cbd602238966ab06a))
- fix warning ([7ace18a](https://github.com/sdavisde/dttd/commit/7ace18a57c869f78bde02b9a98481bbdfab755b7))
- fix warnings ([0000364](https://github.com/sdavisde/dttd/commit/0000364104849f10404316ebe6d6d16c32a1919a))
- fix weekend option label ([7f26802](https://github.com/sdavisde/dttd/commit/7f2680284103ee84e9e6ac2c0826ae550fbbc9e6))
- fixed broken import ([e1c6676](https://github.com/sdavisde/dttd/commit/e1c6676f8843a158db7f2c4eff794802a1259ec2))
- fixing error when sponsoring candidate ([696309e](https://github.com/sdavisde/dttd/commit/696309e11cfcbe42050a53cdb302ee62c81db5f5))
- force user to go through team forms 1 by 1 ([a3fb350](https://github.com/sdavisde/dttd/commit/a3fb350fbcb10547b81818d3fba9b2aa571d9791))
- format review candidates page ([4b8ccaa](https://github.com/sdavisde/dttd/commit/4b8ccaa8d666c28a26e71d6fdfb52e64afa75221))
- generalize the user experience field ([21430ed](https://github.com/sdavisde/dttd/commit/21430edfc874ac8e3fe5e790cd36c929a626734b))
- get month string correctly to set into essentials training date ([d8be6eb](https://github.com/sdavisde/dttd/commit/d8be6eb59dffb108c8051426426f45f25c037408))
- hide controls with feature flag ([2f585c9](https://github.com/sdavisde/dttd/commit/2f585c91c4478e4aad61c48089c4ad3feb7e49b9))
- homepage design adjustments ([0b8011e](https://github.com/sdavisde/dttd/commit/0b8011e1acb5de82796dbc916d414644c2b189eb))
- improve design to match the rest of the homepage ([c000acc](https://github.com/sdavisde/dttd/commit/c000acca092f93920b41b7f0db512365f502ae93))
- improve previous roles section of team forms ([78e3d30](https://github.com/sdavisde/dttd/commit/78e3d30108170478ffdd3ef2edc0ba38fa5e7cd3))
- improve sep of logic ([e773f31](https://github.com/sdavisde/dttd/commit/e773f31bea07e38f3aec345f474a5337a5841e84))
- improve text ([9c9f843](https://github.com/sdavisde/dttd/commit/9c9f843d5e75c58bd56de0b6eb51d52ad65fc824))
- improve UI design on mobile for the experience chart ([42d40e0](https://github.com/sdavisde/dttd/commit/42d40e05ffd41ab331e26d4dabae4f27adb4c2b3))
- improve UI for status filter ([5aa7844](https://github.com/sdavisde/dttd/commit/5aa784443ef7f8028151a40a462c3395e07fb0aa))
- improve UI of team forms and reduce duplication of wrapping elements ([3108276](https://github.com/sdavisde/dttd/commit/3108276831422c1f6066b11da3ad1577b8e2c4db))
- improve ui on team forms ([6ba7cfb](https://github.com/sdavisde/dttd/commit/6ba7cfb244312dda4eca4332026c5c04dc95f159))
- improve UI/UX on team info sheet form ([ddd54c7](https://github.com/sdavisde/dttd/commit/ddd54c77e90ce3d3966078994cb7ce3656a0dee5))
- improve weekend card UI to clearly show edit and rosters ([05a4333](https://github.com/sdavisde/dttd/commit/05a43337aa33d2a04740319e40a8d1d987c967bd))
- make candidate fee page public ([478c828](https://github.com/sdavisde/dttd/commit/478c828ceb76eebd79c00eada9e0d0d9431b8647))
- make roster table thinner ([211287d](https://github.com/sdavisde/dttd/commit/211287d88683142cf0e4fae190bc3d2cb1104070))
- parse essentials training date correctly ([0674d53](https://github.com/sdavisde/dttd/commit/0674d5329906de0820b6c148ea263785b5975497))
- patch nextjs sec vuln ([f74cec5](https://github.com/sdavisde/dttd/commit/f74cec590454ed586ebf1bd9cb0688896096adb1))
- payment permissions ([7f2978a](https://github.com/sdavisde/dttd/commit/7f2978a23832dfb1653aa35f73be620cf371ae49))
- persist the first 3 team form submissions ([ee8fb67](https://github.com/sdavisde/dttd/commit/ee8fb67faf510ab835daadcf3b0ad920a2596c7c))
- prepare project for semantic release notes ([b0d5f8c](https://github.com/sdavisde/dttd/commit/b0d5f8c728443e549c83bd97154c883e64c24af8))
- put more state into form for single source of truth ([5c2f8eb](https://github.com/sdavisde/dttd/commit/5c2f8eb31cc53293c46ac3e57cd4e9c712e7f29c))
- redriect to admin from roles page if user doesn't have permission ([98c2f0a](https://github.com/sdavisde/dttd/commit/98c2f0a9fd8a2b3ec36e6cceeaacf00403cacd22))
- remaining lint errs ([5e4b9c2](https://github.com/sdavisde/dttd/commit/5e4b9c28c1a32bb3c8a29ef8ce8fdcd663f09ad5))
- remove engine causing errors ([583b2ca](https://github.com/sdavisde/dttd/commit/583b2ca71da24e806087d1049bf1a41603e1cad8))
- remove medical information ([7e6a08b](https://github.com/sdavisde/dttd/commit/7e6a08bee660772a1bffc3dba2bf75acd0f3781d))
- remove team fees from dashboard since they're now in the todo list ([caf8614](https://github.com/sdavisde/dttd/commit/caf8614d6eb2b13c1e71ed064bf625ef17b78977))
- remove title fallback from scheduling fn ([d699100](https://github.com/sdavisde/dttd/commit/d69910016a2c51acede44531a793bdb2e5219228))
- remove unused comp ([5285b4e](https://github.com/sdavisde/dttd/commit/5285b4efde86fc81d2e6acb82f30bad82315b72f))
- render the correct team fee amount in committment forms ([1a7da31](https://github.com/sdavisde/dttd/commit/1a7da3101c0c19f6b9071c64d16ea7a190381f46))
- replace remaining instance of old key ([3ad43d3](https://github.com/sdavisde/dttd/commit/3ad43d3bbc9430944669ecfdc5fd4808dfbb9a81))
- respect user cha_role in security ([ddba2a5](https://github.com/sdavisde/dttd/commit/ddba2a5a75488eb4ab92e526901a0c0e08ac043e))
- run prettier on all files ([17623dc](https://github.com/sdavisde/dttd/commit/17623dce31923297ff926b32f6cf139715bd048c))
- stop sending Error objects back from server actions, sending strings instead ([ebfeb52](https://github.com/sdavisde/dttd/commit/ebfeb52913e7b3c211b0b6465e9acb08c458b94e))
- update env variables ([5f3d00c](https://github.com/sdavisde/dttd/commit/5f3d00ceb8ef5d9c13fa15828db6a12de17f7420))
- update error to string to try and fix prod error ([7c74e55](https://github.com/sdavisde/dttd/commit/7c74e55a405a1077cd70da1161a5b10d9afb2eb9))
- update some design around master roster ([bfc4106](https://github.com/sdavisde/dttd/commit/bfc4106b124800d31eba1cb30865569a34407f2e))
- update status documentation for candidate table ([bffcf4a](https://github.com/sdavisde/dttd/commit/bffcf4ad2fa63a87e9912af9b1745382cc887e59))
- update wording for medical conditions field ([a2d19d9](https://github.com/sdavisde/dttd/commit/a2d19d93b17ed9db5d7b47b4cd79618b9df45848))
- upgrade supabase version to most recent ([ca81768](https://github.com/sdavisde/dttd/commit/ca817680985372974970f20be45083245c8efd55))
- upgrade versions again ([94870b6](https://github.com/sdavisde/dttd/commit/94870b6e35cb96b30d9785b77645ba7534b0289e))
- use admin client during webhook flow ([9990fc2](https://github.com/sdavisde/dttd/commit/9990fc2f4e4af6d20297bcdb146744c239a729dc))
- use consistent date formatting to ensure consistency in showing ([a494a9f](https://github.com/sdavisde/dttd/commit/a494a9f73bf367a828820d639822679fb47268f3))
- use date instead of string to power date picker, reducing string ([182cd98](https://github.com/sdavisde/dttd/commit/182cd98ef9a4baf899d97a7ba1eaaa81347988b2))
- use enum for weekend statuses ([7a85d0e](https://github.com/sdavisde/dttd/commit/7a85d0ea779b213c9f52fbdce4db8e751ba7e4c9))
- use permissions to hide user experience ([68193d0](https://github.com/sdavisde/dttd/commit/68193d0f95633d8e1fdf14fe09569c4b11e235ce))
- use sonner instead of alert ([29e88a8](https://github.com/sdavisde/dttd/commit/29e88a843cdd3fa553b14d22b7e11a0b6d88fe27))
- use updated db columns when saving forms, and add one for the last form step ([b40f5c1](https://github.com/sdavisde/dttd/commit/b40f5c1441187c1d79b9d6864faf52378df7501c))
