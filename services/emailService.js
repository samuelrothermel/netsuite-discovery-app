// Email Service - DISABLED
// This is a stub file since email functionality is disabled

class EmailService {
  constructor() {
    console.log('⚠️  Email service is disabled');
  }

  async sendChecklistEmail(recipients, merchantName, docxBuffer) {
    console.log(
      '⚠️  Email sending is disabled. Recipients would have been:',
      recipients.join(', ')
    );
    throw new Error(
      'Email functionality is currently disabled. Please use the download option.'
    );
  }

  async testConnection() {
    console.log('⚠️  Email service is disabled - no connection to test');
    return false;
  }
}

module.exports = new EmailService();
