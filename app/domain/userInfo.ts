export class UserInfo {
  stakeholders: Stakeholder[];
  coordinators: Coordinator[];
  user: User;
  admin: boolean;

  constructor() {
    this.user = new User();
  }
}

export class Stakeholder {
  associationMember: string;
  contributors: string[];
  country: string;
  id: string;
  managers: string[];
  name: string;
  subType: string;
  type: string;
  madated: boolean;


  constructor() {
    this.associationMember = null;
    // this.contributors = null;
    this.country = null;
    this.id = null;
    // this.managers = null;
    this.name = null;
    this.subType = null;
    this.type = null;
    this.madated = null;
  }
}

export class Coordinator {
  id: string;
  name: string;
  type: string;
  members: string[];
}

export class User {
  sub: string;
  email: string;
  name: string;
  surname: string;
  fullname: string;
  policiesAccepted: PolicyAccepted[];
  profile: Profile;
  id: string

  constructor() {
    this.profile = new Profile();
  }
}

export class PolicyAccepted {
  id: string;
  time: number;
  acceptedDate: number;
}

export class Profile {
  picture: string | ArrayBuffer;
  position: string;
  affiliation: string;
  webpage: string;

  constructor() {
    this.picture = null
    this.position = null
    this.affiliation = null
    this.webpage = null
  }
}

export class StakeholdersMembers {
  contributors: User[];
  managers: User[];
}

export class UserActivity {
  sessionId: string;
  fullname: string;
  action: string;
  date: Date;
}
