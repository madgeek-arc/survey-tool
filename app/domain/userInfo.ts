export class UserInfo {
  stakeholders: Stakeholder[];
  coordinators: Coordinator[];
  user: User;
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
  email: string;
  fullname: string;
  name: string;
  sub: string;
  surname: string;
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
