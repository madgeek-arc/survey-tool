import { Component } from '@angular/core';
import { PageContentComponent } from "../../../shared/page-content/page-content.component";

interface Guide {
  title: string;
  description: string;
  fileType: 'PDF';
  fileSize: string;
  icon: string;
  filePath: string;
  fileName: string;
}

export interface FaqItems {
  question: string;
  answer: string;
}

export interface FaqCategory {
  category: string;
  items: FaqItems[];
}

@Component({
  selector: 'app-support-page',
  templateUrl: './support-page.component.html',
  imports: [PageContentComponent],
  standalone: true
})
export class SupportPageComponent {

  readonly guides: Guide[] = [
    {
      title: 'Signing in to the EOSC Open Science Observatory using the OpenAIRE AAI',
      description: 'Step-by-step guide to authenticate and access the EOSC Observatory platform.',
      fileType: 'PDF',
      fileSize: '667 KB',
      icon: 'description',
      filePath: 'assets/pdf/Signing in to the EOSC Open Science Observatory.pdf',
      fileName: 'Signing in to the EOSC Open Science Observatory.pdf'
    },
    {
      title: 'Accessing the survey tool',
      description: 'Instructions for navigating to the survey tool from the home page.',
      fileType: 'PDF',
      fileSize: '674 KB',
      icon: 'menu_book',
      filePath: 'assets/pdf/Accessing the survey tool.pdf',
      fileName: 'Accessing the survey tool.pdf'
    },
    {
      title: 'Accessing the current (or a previous) survey',
      description: 'Guide to finding and opening current and historical surveys.',
      fileType: 'PDF',
      fileSize: '925 KB',
      icon: 'description',
      filePath: 'assets/pdf/Accessing the current (or previous) survey.pdf',
      fileName: 'Accessing the current (or previous) survey.pdf'
    },
    {
      title: 'Commenting on a survey',
      description: 'How to add, edit, and manage internal comments on survey questions.',
      fileType: 'PDF',
      fileSize: '1,649 KB',
      icon: 'menu_book',
      filePath: 'assets/pdf/Commenting on a survey .pdf',
      fileName: 'Commenting on a survey.pdf'
    },
    {
      title: 'Accessing the history of the survey answers',
      description: 'View, compare, and restore previous versions of survey responses.',
      fileType: 'PDF',
      fileSize: '1,130 KB',
      icon: 'description',
      filePath: 'assets/pdf/Accessing the history of the survey answers.pdf',
      fileName: 'Accessing the history of the survey answers.pdf'
    },
    {
      title: 'Importing a previous survey answer to a new survey',
      description: 'Import historical survey data as a starting point for new surveys.',
      fileType: 'PDF',
      fileSize: '681 KB',
      icon: 'menu_book',
      filePath: 'assets/pdf/Importing a previous survey answer to a new survey.pdf',
      fileName: 'Importing a previous survey answer to a new survey.pdf'
    },
    {
      title: 'Assigning contributors to help you fill in the survey',
      description: 'Manage team access and add contributors to your survey group.',
      fileType: 'PDF',
      fileSize: '628 KB',
      icon: 'description',
      filePath: 'assets/pdf/Assigning contributors to help you fill in the survey.pdf',
      fileName: 'Assigning contributors to help you fill in the survey.pdf'
    }
  ];

  faqCategories: FaqCategory[] = [
    {
      category: 'Access & Login',
      items: [
        {
          question: 'How do I access the EOSC Open Science Observatory?',
          answer: 'Visit https://www.eoscobservatory.eu/ and click Login in the top-right corner. You will be redirected' +
            ' to the OpenAIRE AAI where you can log in using one of the supported Identity Providers.'
        },
        {
          question: 'What should I do if I cannot find my Identity Provider in the login screen?',
          answer: 'There are two options: use a different email address associated with one of the available' +
            ' Identity Providers and notify the support team; or create an account with the OpenAIRE Identity Provider.' +
            ' Once successfully logged in, you will be redirected to the EOSC Open Science Observatory home page.'
        },
        {
          question: 'How do I navigate to the survey tool after logging in?',
          answer: 'After logging in, click on your name at the top right of the screen. A submenu labelled "EOSC SB' +
            ' (your country name)" will appear. Click on it to be redirected to the home page of the survey tool.'
        }
      ]
    },
    {
      category: 'Survey',
      items: [
        {
          question: 'How do I find the current survey and previous surveys?',
          answer: 'Click on "My Surveys" in the sidebar. This page displays both the current survey and all previous' +
            ' surveys associated with your country.'
        },
        {
          question: 'What are the different modes for accessing a survey (View, Edit, Validate)?',
          answer: 'View – Read-only mode; the only mode available once a survey has been validated or locked.' +
            ' Edit – Allows you to open, fill in, and submit parts of the survey as many times as needed. Validate' +
            ' – Marks the survey as complete and locks it from further editing. Only validated surveys appear on the' +
            ' public EOSC readiness dashboard. You can re-open it using "Re-open" until the survey period ends.'
        },
        {
          question: 'Can I see if someone else from my group is editing the survey at the same time?',
          answer: 'Yes. When you open a survey, the tool will notify you if another manager or contributor is' +
            ' currently accessing it, and in which mode (Edit or View).'
        },
        {
          question: 'Can I undo a radio button selection I made by mistake?',
          answer: 'Yes. A recent update added the ability to clear a radio button selection if clicked by' +
            ' mistake — simply click the selected option again to deselect it.'
        },
        {
          question: 'How do I import answers from a previous survey into the current one?',
          answer: 'Use the "Import" option on the current survey, select the previous survey you want to use as a' +
            ' starting point, and click "Import". Note: this will overwrite any answers already entered, so it is best' +
            ' practice to import at the very beginning. If you change your mind, you can restore the previous version' +
            ' through the History feature.'
        }
      ]
    },
    {
      category: 'History',
      items: [
        {
          question: 'How do I access the version history of a survey?',
          answer: 'Open the survey and select the "History" option. This view starts with the latest version and lists' +
            ' all previous versions on the right side, including the date and the role of the person who created each version.'
        },
        {
          question: 'How do I restore a previous version of the survey?',
          answer: 'In the History view, click on the version you want to restore, then click the "Restore this version"' +
            ' button. This replaces the current version with the answers from the selected version.'
        },
        {
          question: 'Can I compare two versions of the survey side by side?',
          answer: 'Yes. In the History view, use the checkboxes on the right to select any two versions, then click' +
            ' "Compare versions". The tool will display both versions side by side.'
        }
      ]
    },
    {
      category: 'Comments',
      items: [
        {
          question: 'What are internal comments and who can see them?',
          answer: 'Internal comments are private notes you can add while working on a survey — for example, to record' +
            ' where you sourced a specific data point. They are only visible to members of your group and EC' +
            ' coordinators. They are not part of the survey itself and are not exported with the dataset.'
        },
        {
          question: 'Can I edit or delete a comment?',
          answer: 'You can only edit or delete comments you added yourself. To delete an entire thread, you must be the' +
            ' person who added the first comment in that thread.'
        },
        {
          question: 'Will my comments carry over when I start a new survey year?',
          answer: 'When you import a previous year\'s survey answers into the new survey, you will have the option to' +
            ' also import the comments. This is optional.'
        }
      ]
    },
    {
      category: 'Team',
      items: [
        {
          question: 'How do I add a contributor to help fill in the survey?',
          answer: 'Click on "My Group" in the sidebar, then click "Add new contributor". Enter the contributor\'s email' +
            ' address (the one they will use to log in to the Observatory) and click "Get invitation token". Copy the' +
            ' token and send it to them — when they click the link and log in, they will have access to the surveys.'
        }
      ]
    },
    {
      category: 'Communications',
      items: [
        {
          question: 'What is the Communications module used for?',
          answer: 'It allows you to receive messages from external users with questions about the public dashboard data' +
            ' for your country, and to send messages to other country representatives, the EOSC SB coordinator' +
            ' (GD-RTD representative), or OpenAIRE administrators.'
        },
        {
          question: 'How do I reply to a message, and is my identity revealed?',
          answer: 'Select a message from the table to open it, then click the reply icon. By default, your name is'
            + ' hidden from external users unless you deselect the "Don\'t show my name as sender" option. Your email' +
            ' address is always hidden. '
        },
        {
          question: 'What happens to my messages if the country representative changes?',
          answer: 'Messages are associated with the country, not the individual. If the representative changes,' +
            ' the new one will have access to all previous messages and will continue to receive new ones.'
        },
        {
          question: 'How will I know if I have new unread messages?',
          answer: 'A notification badge showing the count of unread messages will appear at the top right of the screen,' +
            ' next to your initials.'
        }
      ]
    }
  ];
}
