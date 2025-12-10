import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

export interface Message {
  id: number;
  content: string;
  timestamp: string;
  isFromUser: boolean;
}

export interface Contact {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  isOnline: boolean;
  unreadCount: number;
  currentMessage?: string;
  messages: Message[];
}

@Component({
  selector: 'app-contact-admin',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contact-admin.component.html',
  styleUrl: './contact-admin.component.css'
})
export class ContactAdmin {
  selectedContact: Contact | null = null;
  responseMessage: string = '';

  contacts: Contact[] = [
    {
      id: 1,
      name: 'Anil',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      lastMessage: "April fool's day",
      lastMessageTime: 'Today 9:52pm',
      isOnline: true,
      unreadCount: 0,
      messages: [
        {
          id: 1,
          content: "Hey admin, I wanted to ask about the April fool's day event. Are we still planning to do something special?",
          timestamp: 'Today 9:50pm',
          isFromUser: false
        }
      ]
    },
    {
      id: 2,
      name: 'Chuuthiya',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      lastMessage: 'Baag',
      lastMessageTime: 'Today 12:11pm',
      isOnline: true,
      unreadCount: 2,
      messages: [
        {
          id: 1,
          content: 'Baag - I need help with my order status. Can you please check?',
          timestamp: 'Today 12:11pm',
          isFromUser: false
        }
      ]
    },
    {
      id: 3,
      name: "Mary ma'am",
      avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
      lastMessage: 'You have to report it...',
      lastMessageTime: 'Today 2:40pm',
      isOnline: false,
      unreadCount: 1,
      messages: [
        {
          id: 1,
          content: 'You have to report it to the technical team. There seems to be an issue with the payment gateway.',
          timestamp: 'Today 2:40pm',
          isFromUser: false
        }
      ]
    },
    {
      id: 4,
      name: 'Bill Gates',
      avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
      lastMessage: 'Nevermind bro',
      lastMessageTime: 'Yesterday 12:31pm',
      isOnline: false,
      unreadCount: 0,
      messages: [
        {
          id: 1,
          content: 'Hey, I was wondering about the enterprise packages you offer.',
          timestamp: 'Yesterday 12:25pm',
          isFromUser: false
        },
        {
          id: 2,
          content: 'Hi Bill! Thanks for your interest. Let me get you the details right away.',
          timestamp: 'Yesterday 12:28pm',
          isFromUser: true
        },
        {
          id: 3,
          content: 'Nevermind bro, I found what I was looking for. Thanks anyway!',
          timestamp: 'Yesterday 12:31pm',
          isFromUser: false
        }
      ]
    },
    {
      id: 5,
      name: 'Victoria H',
      avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
      lastMessage: "Okay, brother. let's see...",
      lastMessageTime: 'Wednesday 11:12am',
      isOnline: true,
      unreadCount: 0,
      messages: [
        {
          id: 1,
          content: 'I have a concern about the delivery times in my area.',
          timestamp: 'Wednesday 11:10am',
          isFromUser: false
        },
        {
          id: 2,
          content: "Okay, brother. let's see what we can do to improve the delivery service in your location.",
          timestamp: 'Wednesday 11:12am',
          isFromUser: false
        }
      ]
    },
    {
      id: 6,
      name: 'Anil hazraoui',
      avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
      lastMessage: 'Hello StudyZone Store team...',
      lastMessageTime: 'Today 3:15pm',
      isOnline: true,
      unreadCount: 1,
      currentMessage: `Hello StudyZone Store team,
I'm interested in the black hoodie with the store logo (size M), but I'd like to know if it will be available again soon — it's currently out of stock.
Also, do you offer delivery during campus events, or only pickup?
Thanks in advance for your help!`,
      messages: [
        {
          id: 1,
          content: `Hello StudyZone Store team,
I'm interested in the black hoodie with the store logo (size M), but I'd like to know if it will be available again soon — it's currently out of stock.
Also, do you offer delivery during campus events, or only pickup?
Thanks in advance for your help!`,
          timestamp: 'Today 3:15pm',
          isFromUser: false
        }
      ]
    }
  ];

  selectContact(contact: Contact): void {
    this.selectedContact = contact;
    this.responseMessage = '';
    
    // Mark messages as read
    contact.unreadCount = 0;
  }

  sendResponse(): void {
    if (!this.selectedContact || !this.responseMessage.trim()) {
      return;
    }

    // Add the response to the conversation
    const newMessage: Message = {
      id: this.selectedContact.messages.length + 1,
      content: this.responseMessage.trim(),
      timestamp: new Date().toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      isFromUser: true
    };

    this.selectedContact.messages.push(newMessage);

    // Update the last message in the contact list
    this.selectedContact.lastMessage = this.responseMessage.trim();
    this.selectedContact.lastMessageTime = 'Just now';

    // Clear the response input
    this.responseMessage = '';

    // Simulate a read receipt or status update
    setTimeout(() => {
      if (this.selectedContact) {
        console.log(`Message sent to ${this.selectedContact.name}`);
      }
    }, 1000);
  }

  // Simulate receiving new messages
  simulateIncomingMessage(contactId: number, message: string): void {
    const contact = this.contacts.find(c => c.id === contactId);
    if (contact) {
      const newMessage: Message = {
        id: contact.messages.length + 1,
        content: message,
        timestamp: new Date().toLocaleString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        isFromUser: false
      };

      contact.messages.push(newMessage);
      contact.lastMessage = message;
      contact.lastMessageTime = 'Just now';
      
      // Only increment unread count if not currently selected
      if (this.selectedContact?.id !== contactId) {
        contact.unreadCount++;
      }
    }
  }
}
