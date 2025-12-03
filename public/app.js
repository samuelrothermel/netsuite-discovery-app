// State Management
const state = {
  currentSection: 1,
  totalSections: 8,
  formData: {},
};

// DOM Elements
const form = document.getElementById('discoveryForm');
const sections = document.querySelectorAll('.section');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const backBtn = document.getElementById('backBtn');
const nextBtn = document.getElementById('nextBtn');
const downloadBtn = document.getElementById('downloadBtn');
const emailBtn = document.getElementById('emailBtn');
const resetBtn = document.getElementById('resetBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const successMessage = document.getElementById('successMessage');
const formContainer = document.getElementById('form-container');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  attachEventListeners();
  setupConditionalFields();
  updateProgress();
});

// Event Listeners
function attachEventListeners() {
  backBtn.addEventListener('click', goBack);
  nextBtn.addEventListener('click', goNext);
  downloadBtn.addEventListener('click', downloadChecklist);
  emailBtn.addEventListener('click', showEmailDisabledMessage);
  resetBtn.addEventListener('click', resetForm);

  // Listen for field changes to update conditional visibility
  document.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('change', setupConditionalFields);
  });
}

// Email Disabled Message
function showEmailDisabledMessage() {
  alert(
    'Email functionality is currently disabled. Please use the Download button instead.'
  );
}

// Conditional Field Visibility
function setupConditionalFields() {
  const formData = getFormData();

  // ACH Config Group
  const achGroup = document.getElementById('achConfigGroup');
  if (formData.acceptACH === 'yes') {
    achGroup.style.display = 'block';
  } else {
    achGroup.style.display = 'none';
  }

  // Migration Group
  const migrationGroup = document.getElementById('migrationGroup2');
  if (migrationGroup && formData.hasExistingVault === 'yes') {
    migrationGroup.style.display = 'block';
  } else if (migrationGroup) {
    migrationGroup.style.display = 'none';
  }
}

// Get Form Data
function getFormData() {
  const formData = new FormData(form);
  const data = {
    merchantName: formData.get('merchantName'),
    merchantEmail: formData.get('merchantEmail'),
    teamEmails: formData.get('teamEmails')
      ? formData
          .get('teamEmails')
          .split(',')
          .map(e => e.trim())
          .filter(e => e)
      : [],
    businessModel: formData.get('businessModel'),
    currentProcessor: formData.get('currentProcessor'),
    hasExistingVault: formData.get('hasExistingVault'),
    wantsMigration: formData.get('wantsMigration'),
    migrateData: formData.getAll('migrateData'),
    processingTimeline: formData.get('processingTimeline'),
    needsReauth: formData.get('needsReauth') === 'on',
    partialCapture: formData.get('partialCapture') === 'on',
    overCapture: formData.get('overCapture') === 'on',
    neitherCapture: formData.get('neitherCapture') === 'on',
    l2l3Processing: formData.get('l2l3Processing'),
    l2l3Data: formData.getAll('l2l3Data'),
    acceptACH: formData.get('acceptACH'),
    achNetworkCheck: formData.get('achNetworkCheck') === 'on',
    achRecurring: formData.get('achRecurring') === 'on',
    achRealtimeStatus: formData.get('achRealtimeStatus') === 'on',
    paymentMethods: formData.getAll('paymentMethods'),
    processingChannels: formData.getAll('processingChannels'),
    fraudRate: formData.get('fraudRate'),
    fraudProtectionAdvanced: formData.get('fraudProtectionAdvanced'),
    needs3ds: formData.get('needs3ds'),
  };

  state.formData = data;
  return data;
}

// Validation
function validateSection(sectionNumber) {
  const section = document.querySelector(
    `.section[data-section="${sectionNumber}"]`
  );
  const requiredFields = section.querySelectorAll('[required]');

  let isValid = true;
  requiredFields.forEach(field => {
    if (field.type === 'radio') {
      const radioGroup = document.querySelectorAll(
        `input[name="${field.name}"]`
      );
      const isChecked = Array.from(radioGroup).some(r => r.checked);
      if (!isChecked) {
        field.classList.add('error');
        isValid = false;
      } else {
        field.classList.remove('error');
      }
    } else if (
      field.type === 'checkbox' &&
      field.name === 'processingChannels'
    ) {
      const checkboxes = document.querySelectorAll(
        `input[name="${field.name}"]:not(:disabled)`
      );
      const isChecked = Array.from(checkboxes).some(c => c.checked);
      if (!isChecked) {
        field.classList.add('error');
        isValid = false;
      } else {
        field.classList.remove('error');
      }
    } else if (field.value.trim() === '') {
      field.classList.add('error');
      isValid = false;
    } else {
      field.classList.remove('error');
    }
  });

  return isValid;
}

// Navigation
function updateProgress() {
  const progress = (state.currentSection / state.totalSections) * 100;
  progressFill.style.width = `${progress}%`;
  progressText.textContent = `Step ${state.currentSection} of ${state.totalSections}`;

  backBtn.style.display = state.currentSection === 1 ? 'none' : 'block';

  if (state.currentSection === state.totalSections) {
    nextBtn.style.display = 'none';
    downloadBtn.style.display = 'inline-block';
    emailBtn.style.display = 'inline-block';
    resetBtn.style.display = 'inline-block';
  } else {
    nextBtn.style.display = 'inline-block';
    downloadBtn.style.display = 'none';
    emailBtn.style.display = 'none';
    resetBtn.style.display = 'none';
  }
}

function showSection(sectionNumber) {
  sections.forEach(section => {
    section.classList.remove('active');
  });

  const targetSection = document.querySelector(
    `.section[data-section="${sectionNumber}"]`
  );
  if (targetSection) {
    targetSection.classList.add('active');
  }

  state.currentSection = sectionNumber;
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goNext() {
  if (validateSection(state.currentSection)) {
    getFormData(); // Update form data
    if (state.currentSection < state.totalSections) {
      showSection(state.currentSection + 1);
    }
  } else {
    alert('Please fill in all required fields');
  }
}

function goBack() {
  getFormData();
  if (state.currentSection > 1) {
    showSection(state.currentSection - 1);
  }
}

function resetForm() {
  if (confirm('Reset form and start over?')) {
    form.reset();
    state.currentSection = 1;
    state.formData = {};
    showSection(1);
    location.reload();
  }
}

// View Summary (navigate to results page)
async function downloadChecklist() {
  getFormData();

  if (!state.formData.merchantName) {
    alert('Please enter merchant name');
    return;
  }

  // Store form data in sessionStorage for results page
  sessionStorage.setItem('checklistFormData', JSON.stringify(state.formData));

  // Navigate to results page
  window.location.href = 'results.html';
}

// UI Helpers
function showSuccess(message) {
  loadingIndicator.style.display = 'none';
  document.getElementById('successText').innerHTML = message;
  successMessage.style.display = 'block';
  formContainer.style.display = 'none';
}
