import {
  filterMemberNav,
  getMemberNav,
  getMemberNavIcon,
  getTabBarItems,
  isMemberNavItemActive,
  memberFooterNavItems,
  memberNavItems,
} from '@/lib/member/navigation'
import { Permission } from '@/lib/security'
import type { User } from '@/lib/users/types'
import type { TeamMemberInfo } from '@/lib/weekend/types'

function makeUser(
  permissions: Permission[],
  teamMemberInfo: TeamMemberInfo | null = null
): User {
  return {
    id: 'user-1',
    firstName: 'Test',
    lastName: 'User',
    gender: null,
    email: 'test@example.com',
    phoneNumber: null,
    address: null,
    profilePhotoPath: null,
    profilePhotoUpdatedAt: null,
    roles: [],
    permissions: new Set(permissions),
    communityInformation: {
      churchAffiliation: null,
      weekendAttended: null,
      essentialsTrainingDate: null,
      specialGiftsAndSkills: null,
    },
    teamMemberInfo,
    originalUser: null,
  }
}

const onTeam: TeamMemberInfo = {
  groupMemberId: 'gm-1',
  groupId: 'group-1',
  groupNumber: 12,
  weekendAssignments: [],
}

describe('memberNavItems', () => {
  it('names the menu after member tasks, in board order', () => {
    expect(memberNavItems.map((item) => item.title)).toEqual([
      'Home',
      'Sponsor someone',
      'My forms',
      'Pay a fee',
      'Roster',
      'The weekends',
      'Documents',
    ])
    expect(memberFooterNavItems.map((item) => item.title)).toEqual([
      'My account',
      'Admin',
    ])
  })

  it('groups items into the board sections', () => {
    const sections = Object.fromEntries(
      memberNavItems.map((item) => [item.title, item.section])
    )
    expect(sections).toEqual({
      Home: null,
      'Sponsor someone': 'Do something',
      'My forms': 'Do something',
      'Pay a fee': 'Do something',
      Roster: 'Find',
      'The weekends': 'Find',
      Documents: 'Find',
    })
  })

  it('resolves an icon for every item', () => {
    for (const item of [...memberNavItems, ...memberFooterNavItems]) {
      expect(getMemberNavIcon(item.href)).toBe(item.icon)
    }
    expect(getMemberNavIcon('/nowhere')).toBeUndefined()
  })
})

describe('filterMemberNav', () => {
  it('hides team-only items from people not on the active team', () => {
    const titles = filterMemberNav(memberNavItems, makeUser([])).map(
      (item) => item.title
    )
    expect(titles).not.toContain('My forms')
    expect(titles).not.toContain('Pay a fee')
  })

  it('shows team-only items to team members', () => {
    const titles = filterMemberNav(memberNavItems, makeUser([], onTeam)).map(
      (item) => item.title
    )
    expect(titles).toContain('My forms')
    expect(titles).toContain('Pay a fee')
  })

  it('shows Admin only with the admin-portal permission', () => {
    expect(getMemberNav(makeUser([])).footer.map((i) => i.title)).toEqual([
      'My account',
    ])
    expect(
      getMemberNav(makeUser([Permission.READ_ADMIN_PORTAL])).footer.map(
        (i) => i.title
      )
    ).toEqual(['My account', 'Admin'])
    expect(
      getMemberNav(makeUser([Permission.FULL_ACCESS])).footer.map(
        (i) => i.title
      )
    ).toEqual(['My account', 'Admin'])
  })

  it('serializes without icon components', () => {
    const nav = getMemberNav(makeUser([]))
    for (const item of [...nav.main, ...nav.footer]) {
      expect(Object.keys(item).sort()).toEqual(
        ['href', 'section', 'tab', 'title'].sort()
      )
    }
  })
})

describe('getTabBarItems', () => {
  it('lists the five phone tabs in order', () => {
    const tabs = getTabBarItems(getMemberNav(makeUser([], onTeam)))
    expect(tabs.map((item) => item.title)).toEqual([
      'Home',
      'Roster',
      'The weekends',
      'Documents',
      'My account',
    ])
  })
})

describe('isMemberNavItemActive', () => {
  it('matches the route and its children only', () => {
    expect(isMemberNavItemActive('/files', '/files')).toBe(true)
    expect(isMemberNavItemActive('/files', '/files/handbook')).toBe(true)
    expect(isMemberNavItemActive('/files', '/filesystem')).toBe(false)
    expect(isMemberNavItemActive('/home', '/')).toBe(false)
  })
})
