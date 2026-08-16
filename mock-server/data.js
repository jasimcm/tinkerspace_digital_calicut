const MOCK_MAKERS = [
  {
    membershipId: 'mk-001',
    name: 'Harry Potter',
    purpose: 'Working on a project',
    workingOn: 'Marauder Map refresh',
    avatar: '',
  },
  {
    membershipId: 'mk-002',
    name: 'Hermione Granger',
    purpose: 'Self Learning',
    workingOn: 'Advanced arithmancy notes',
    avatar: '',
  },
  {
    membershipId: 'mk-003',
    name: 'Rubeus Hagrid',
    purpose: 'On duty',
    workingOn: 'Care of magical creatures desk',
    avatar: '',
  },
  {
    membershipId: 'mk-004',
    name: 'Luna Lovegood',
    purpose: 'Attending an event',
    workingOn: 'Spectrespecs prototyping night',
    avatar: '',
  },
  {
    membershipId: 'mk-005',
    name: 'Ron Weasley',
    purpose: 'Working on a project',
    projectName: 'Wizard chess scoreboard',
    avatar: '',
  },
  {
    membershipId: 'mk-006',
    name: 'Ginny Weasley',
    purpose: 'Visiting',
    workingOn: 'Daily Prophet open house',
    avatar: '',
  },
];

function getMockMakers() {
  return MOCK_MAKERS;
}

module.exports = {
  getMockMakers,
};
