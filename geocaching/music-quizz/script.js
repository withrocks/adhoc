let allData = [];
let filteredData = [];
let bandsData = [];
let finalSolutionLinks = {}; // Maps sourceFile to final solution link
let imageStates = {}; // Store image states
let lastSelectedBand = '';
let bandsFuse = null; // Fuse.js instance
let searchTimeout = null;
let currentHighlightIndex = -1;

// Band search functionality
function getBandUsageCounts() {
  const counts = {};
  Object.values(imageStates).forEach(state => {
    if (state.band) {
      counts[state.band] = (counts[state.band] || 0) + 1;
    }
  });
  return counts;
}

function initializeFuseSearch() {
  if (bandsData.length === 0) return;
  
  const options = {
    includeScore: true,
    threshold: 0.1, // Much more strict matching
    distance: 1000, // Allow characters to be far apart
    minMatchCharLength: 1,
    findAllMatches: false,
    includeMatches: false,
    shouldSort: true,
    ignoreLocation: false, // Don't ignore where in the string the match occurs
    ignoreFieldNorm: true,
    keys: ['name']
  };
  
  const searchData = bandsData.map(band => ({ name: band }));
  bandsFuse = new Fuse(searchData, options);
}

function searchBands(query) {
  if (!bandsFuse) return [];
  
  if (!query.trim()) {
    // Return all bands when no query
    return bandsData.slice(0, 25).map(band => ({ item: { name: band } }));
  }
  
  const results = bandsFuse.search(query);
  return results.slice(0, 25); // Limit to 25 results
}

function renderBandDropdown(results, usageCounts) {
  const dropdown = document.getElementById('large-band-dropdown');
  dropdown.innerHTML = '';
  currentHighlightIndex = -1;
  
  if (results.length === 0) {
    dropdown.innerHTML = '<div class="band-option">No bands found</div>';
    return;
  }
  
  results.forEach((result, index) => {
    const band = result.item.name;
    const usageCount = usageCounts[band] || 0;
    const isUsed = usageCount > 0;
    
    const option = document.createElement('div');
    option.className = `band-option${isUsed ? ' used' : ''}`;
    option.dataset.index = index;
    option.dataset.band = band;
    
    option.innerHTML = `
      ${isUsed ? '<span class="band-used-icon">★</span>' : ''}
      <span>${band}</span>
      ${isUsed ? `<span class="band-usage-count">(${usageCount}x)</span>` : ''}
    `;
    
    option.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      selectBand(band);
    });
    dropdown.appendChild(option);
  });
}

function selectBand(band) {
  const input = document.getElementById('large-band-search');
  const dropdown = document.getElementById('large-band-dropdown');
  
  input.value = band;
  dropdown.classList.remove('show');
  
  // Immediately update the state when a band is selected
  if (currentLargeImageUrl) {
    updateImageState(currentLargeImageUrl, 'band', band);
    console.log(`Selected band: ${band} for image: ${currentLargeImageUrl}`); // Debug logging
  }
}

function showBandDropdown() {
  const dropdown = document.getElementById('large-band-dropdown');
  dropdown.classList.add('show');
}

function hideBandDropdown() {
  const dropdown = document.getElementById('large-band-dropdown');
  dropdown.classList.remove('show');
  currentHighlightIndex = -1;
}

function highlightBandOption(direction) {
  const options = document.querySelectorAll('.band-option');
  if (options.length === 0) return;
  
  // Remove current highlight
  if (currentHighlightIndex >= 0) {
    options[currentHighlightIndex].classList.remove('highlighted');
  }
  
  // Update index
  if (direction === 'down') {
    currentHighlightIndex = Math.min(currentHighlightIndex + 1, options.length - 1);
  } else if (direction === 'up') {
    currentHighlightIndex = Math.max(currentHighlightIndex - 1, -1);
  }
  
  // Add new highlight
  if (currentHighlightIndex >= 0) {
    options[currentHighlightIndex].classList.add('highlighted');
    options[currentHighlightIndex].scrollIntoView({ block: 'nearest' });
  }
}

function selectHighlightedBand() {
  const highlighted = document.querySelector('.band-option.highlighted');
  if (highlighted) {
    const band = highlighted.dataset.band;
    selectBand(band);
  }
}

// Load and save state from localStorage
function loadImageStates() {
  const saved = localStorage.getItem('bandQuizImageStates');
  if (saved) {
    imageStates = JSON.parse(saved);
  }
}

function saveImageStates() {
  localStorage.setItem('bandQuizImageStates', JSON.stringify(imageStates));
}

function getImageState(imageUrl) {
  if (!imageStates[imageUrl]) {
    imageStates[imageUrl] = {
      status: 'unsolved',
      band: '',
      note: '',
      code: '',
      listened: false
    };
  }
  return imageStates[imageUrl];
}

function updateImageState(imageUrl, field, value) {
  if (!imageStates[imageUrl]) {
    imageStates[imageUrl] = {
      status: 'unsolved',
      band: '',
      note: '',
      code: '',
      listened: false
    };
  }
  imageStates[imageUrl][field] = value;
  
  if (field === 'band' && value) {
    lastSelectedBand = value;
  }
  
  saveImageStates();
  updateStatistics(); // Update statistics whenever state changes
}

async function loadBandsData() {
  try {
    const response = await fetch("bands.txt");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const text = await response.text();
    bandsData = text.trim().split('\n').map(line => line.trim()).filter(Boolean).sort();
  } catch (err) {
    console.error('Failed to load bands.txt:', err);
    bandsData = [];
  }
}

function parseCSV(csvText) {
  const lines = [];
  let currentLine = '';
  let insideQuotes = false;
  
  // Properly parse CSV handling quoted fields with newlines
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];
    
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentLine += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
        currentLine += char;
      }
    } else if (char === '\n' && !insideQuotes) {
      // End of line (not inside quotes)
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else if (char === '\r' && nextChar === '\n' && !insideQuotes) {
      // Windows line ending
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
      i++; // Skip the \n
    } else {
      currentLine += char;
    }
  }
  
  // Add last line if exists
  if (currentLine.trim()) {
    lines.push(currentLine);
  }
  
  const data = [];
  
  for (const line of lines) {
    const parts = parseCSVLine(line);
    if (parts.length >= 3) {
      data.push({
        image: parts[0],
        certitude: parts[1],
        sourceFile: parts[2]
      });
    }
  }
  
  return data;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let insideQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote becomes single quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last field
  result.push(current.trim());
  
  return result;
}

function parseFinalSolutionLinksCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const links = {};
  
  for (const line of lines) {
    if (line.trim()) {
      const parts = line.split(',');
      if (parts.length >= 2) {
        const sourceFile = parts[0].trim();
        const link = parts[1].trim();
        links[sourceFile] = link;
      }
    }
  }
  
  return links;
}

function populateSourceDropdown() {
  const select = document.getElementById('source-select');
  const uniqueSources = [...new Set(allData.map(item => item.sourceFile))].sort();
  
  select.innerHTML = '<option value="">Select a source file...</option>';
  
  for (const source of uniqueSources) {
    const option = document.createElement('option');
    option.value = source;
    option.textContent = source;
    select.appendChild(option);
  }
  
  // Try to restore the last selected source from localStorage
  const lastSelected = localStorage.getItem('bandQuizLastSelectedSource');
  if (lastSelected && uniqueSources.includes(lastSelected)) {
    select.value = lastSelected;
    filterBySource(); // Trigger the filter to show images
  } else if (uniqueSources.length > 0) {
    // Fallback: preselect the first item if no saved selection
    select.value = uniqueSources[0];
    filterBySource(); // Trigger the filter to show images
  }
  
  select.addEventListener('change', filterBySource);
}

function filterBySource() {
  const selectedSource = document.getElementById('source-select').value;
  
  // Save the selected source to localStorage
  if (selectedSource) {
    localStorage.setItem('bandQuizLastSelectedSource', selectedSource);
  } else {
    localStorage.removeItem('bandQuizLastSelectedSource');
  }
  
  if (selectedSource) {
    filteredData = allData.filter(item => item.sourceFile === selectedSource);
    updateCountDisplay();
    renderImages();
  } else {
    filteredData = [];
    updateCountDisplay();
    document.getElementById('image-container').innerHTML = '';
    hideLargeImage();
  }
}

let currentLargeImageUrl = ''; // Track which image is currently shown large

function showLargeImage(item) {
  const display = document.getElementById('large-image-display');
  
  // If clicking the same image that's currently displayed, hide it
  if (currentLargeImageUrl === item.image && display.classList.contains('show')) {
    hideLargeImage();
    return;
  }
  
  // Remove selected class from previously selected image
  const previouslySelected = document.querySelector('.image-item.selected');
  if (previouslySelected) {
    previouslySelected.classList.remove('selected');
  }
  
  const img = document.getElementById('large-image');
  const source = document.getElementById('large-source');
  const certitude = document.getElementById('large-certitude');
  const statusSelect = document.getElementById('large-status-select');
  const bandInput = document.getElementById('large-band-search');
  const noteInput = document.getElementById('large-note-input');
  const container = document.getElementById('image-container');
  
  currentLargeImageUrl = item.image;
  const state = getImageState(item.image);
  
  // Update image and info
  img.src = item.image;
  source.textContent = item.sourceFile;
  certitude.href = item.certitude;
  
  // Initialize Fuse search if not done yet
  if (!bandsFuse && bandsData.length > 0) {
    initializeFuseSearch();
  }
  
  // Set current values
  statusSelect.value = state.status;
  bandInput.value = state.band || '';
  noteInput.value = state.note;
  
  // Set the listened checkbox
  const listenedCheckbox = document.getElementById('large-listened-checkbox');
  listenedCheckbox.checked = state.listened;

  // Set the code
  const codeInput = document.getElementById('large-code-input');
  codeInput.value = state.code || '';
  
  // Find the clicked image element and add selected class
  const clickedImage = document.querySelector(`[data-image="${item.image}"]`)?.closest('.image-item');
  if (clickedImage) {
    clickedImage.classList.add('selected');
    
    // Calculate grid layout
    const containerStyles = window.getComputedStyle(container);
    const containerWidth = container.offsetWidth;
    const gap = parseInt(containerStyles.gap) || 16;
    const minWidth = 200; // minmax(200px, 1fr)
    const itemsPerRow = Math.floor((containerWidth + gap) / (minWidth + gap));
    
    // Find all image items and locate the clicked one
    const allItems = Array.from(container.children).filter(child => 
      child.classList.contains('image-item')
    );
    const clickedIndex = allItems.indexOf(clickedImage);
    
    if (clickedIndex >= 0) {
      // Calculate which row this item is in
      const currentRow = Math.floor(clickedIndex / itemsPerRow);
      // Find the last item in this row
      const lastItemInRow = Math.min((currentRow + 1) * itemsPerRow - 1, allItems.length - 1);
      const insertAfterElement = allItems[lastItemInRow];
      
      // Remove display from its current position and insert after the row
      display.remove();
      insertAfterElement.insertAdjacentElement('afterend', display);
    } else {
      // Fallback: append to container if we can't find the clicked item
      container.appendChild(display);
    }
  } else {
    // Fallback: append to container
    container.appendChild(display);
  }
  
  display.classList.add('show');
}

function hideLargeImage() {
  const display = document.getElementById('large-image-display');
  display.classList.remove('show');
  
  // Remove selected class from currently selected image
  const currentlySelected = document.querySelector('.image-item.selected');
  if (currentlySelected) {
    currentlySelected.classList.remove('selected');
  }
  
  currentLargeImageUrl = '';
}

function setupLargeImageControls() {
  const statusSelect = document.getElementById('large-status-select');
  const bandInput = document.getElementById('large-band-search');
  const noteInput = document.getElementById('large-note-input');
  
  statusSelect.addEventListener('change', (e) => {
    if (currentLargeImageUrl) {
      updateImageState(currentLargeImageUrl, 'status', e.target.value);
      // Update the small image's color
      const smallImage = document.querySelector(`[data-image="${currentLargeImageUrl}"]`)?.closest('.image-item');
      if (smallImage) {
        smallImage.className = 'image-item ' + e.target.value;
      }
    }
  });
  
  // Band search input events
  bandInput.addEventListener('input', (e) => {
    const query = e.target.value;
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Debounced search
    searchTimeout = setTimeout(() => {
      if (bandsFuse) {
        const results = searchBands(query);
        const usageCounts = getBandUsageCounts();
        renderBandDropdown(results, usageCounts);
        showBandDropdown();
      }
    }, 150);
    
    // Update state immediately if user cleared the input
    if (currentLargeImageUrl && !query.trim()) {
      updateImageState(currentLargeImageUrl, 'band', '');
    }
  });
  
  bandInput.addEventListener('focus', () => {
    if (bandsFuse) {
      const query = bandInput.value;
      const results = searchBands(query);
      const usageCounts = getBandUsageCounts();
      renderBandDropdown(results, usageCounts);
      showBandDropdown();
    }
    
    // Scroll to the large image display when band input gets focus
    const largeImageDisplay = document.getElementById('large-image-display');
    if (largeImageDisplay && largeImageDisplay.classList.contains('show')) {
      largeImageDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  
  bandInput.addEventListener('blur', (e) => {
    // Delay hiding to allow clicks on dropdown options
    setTimeout(() => {
      hideBandDropdown();
    }, 200);
  });
  
  bandInput.addEventListener('keydown', (e) => {
    const dropdown = document.getElementById('large-band-dropdown');
    const isDropdownVisible = dropdown.classList.contains('show');
    
    if (!isDropdownVisible) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        highlightBandOption('down');
        break;
      case 'ArrowUp':
        e.preventDefault();
        highlightBandOption('up');
        break;
      case 'Enter':
        e.preventDefault();
        selectHighlightedBand();
        break;
      case 'Escape':
        e.preventDefault();
        hideBandDropdown();
        bandInput.blur();
        break;
    }
  });
  
  noteInput.addEventListener('input', (e) => {
    if (currentLargeImageUrl) {
      updateImageState(currentLargeImageUrl, 'note', e.target.value);
    }
  });
  
  // Listened checkbox events
  const listenedCheckbox = document.getElementById('large-listened-checkbox');
  listenedCheckbox.addEventListener('change', (e) => {
    if (currentLargeImageUrl) {
      updateImageState(currentLargeImageUrl, 'listened', e.target.checked);
    }
  });

  const codeInput = document.getElementById('large-code-input');
  codeInput.addEventListener('input', (e) => {
    if (currentLargeImageUrl) {
      updateImageState(currentLargeImageUrl, 'code', e.target.value);
    }
  });
  
  // Click outside to close dropdown
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.band-search-container')) {
      hideBandDropdown();
    }
  });
  
  // Keyboard navigation for images
  document.addEventListener('keydown', (e) => {
    // Only handle arrow keys if not typing in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      return;
    }
    
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      
      if (filteredData.length === 0) return;
      
      let currentIndex = -1;
      
      // Find current image index if one is displayed
      if (currentLargeImageUrl) {
        currentIndex = filteredData.findIndex(item => item.image === currentLargeImageUrl);
      }
      
      // Calculate next index
      let nextIndex;
      if (e.key === 'ArrowRight') {
        nextIndex = currentIndex < filteredData.length - 1 ? currentIndex + 1 : 0;
      } else { // ArrowLeft
        nextIndex = currentIndex > 0 ? currentIndex - 1 : filteredData.length - 1;
      }
      
      // Show the next image
      showLargeImage(filteredData[nextIndex]);
      
      // Scroll to the currently selected small image
      const currentSmallImage = document.querySelector(`[data-image="${filteredData[nextIndex].image}"]`)?.closest('.image-item');
      if (currentSmallImage) {
        currentSmallImage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
  
  // Auto-focus band search when typing (but not on arrow keys)
  document.addEventListener('keydown', (e) => {
    // Don't auto-focus if already in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      return;
    }
    
    // Don't auto-focus on arrow keys, function keys, modifier keys, etc.
    const excludedKeys = [
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'Tab', 'Escape', 'Enter', 'Backspace', 'Delete',
      'Control', 'Alt', 'Shift', 'Meta',
      'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
      'Home', 'End', 'PageUp', 'PageDown', 'Insert'
    ];
    
    // Don't auto-focus if modifier keys are pressed
    if (e.ctrlKey || e.altKey || e.metaKey) {
      return;
    }
    
    // Don't auto-focus on excluded keys
    if (excludedKeys.includes(e.key)) {
      return;
    }
    
    // Only auto-focus if a large image is currently displayed and the key is a printable character
    if (currentLargeImageUrl && e.key.length === 1) {
      const bandInput = document.getElementById('large-band-search');
      if (bandInput) {
        bandInput.focus();
        // Don't prevent default here so the character gets typed in the input
      }
    }
  });
}

function updateStatistics() {
  const totalImages = allData.length;
  const totalImagesBatch = filteredData.length;
  let solvedCount = 0;
  let listenedCount = 0;
  let solvedCountBatch = 0;
  let sumOfCodes = 0;
  let sumOfCodesString = [];
  
  allData.forEach(item => {
    const state = getImageState(item.image);
    if (state.status === 'solved') {
      solvedCount++;
    }
    if (state.listened) {
      listenedCount++;
    }
  });

  let counter = 0;

  filteredData.forEach(item => {
    counter += 1;
    const state = getImageState(item.image);
    if (state.status === 'solved') {
      solvedCountBatch++;
    }

    let parsable = false;
    if (state.code) {
      const n = Number(state.code);
      if (Number.isFinite(n)) {
        sumOfCodes += n;
        parsable = true;
      }
    }

    if (parsable) {
      sumOfCodesString.push(state.code);
     }
    else {
      sumOfCodesString.push(`⚠️#${counter}`);
    }
  });

  // Update sum of codes display only when all 20 puzzles are solved
  const sumOfCodesContainer = document.getElementById('sum-of-codes-container');
  if (solvedCountBatch === filteredData.length && filteredData.length > 0) {
    sumOfCodesContainer.style.display = 'block';
    document.getElementById('sum-of-codes-total').textContent = sumOfCodes;
    
    // Format the codes nicely with each term on a new line
    const formattedCodes = sumOfCodesString.map((code, index) => {
      const prefix = index === 0 ? '  ' : '+ ';
      return `${prefix}${code}`;
    }).join('\n');
    
    document.getElementById('sum-of-codes-details').textContent = formattedCodes;
    
    // Update final solution link if available
    const finalLinkElement = document.getElementById('final-solution-link');
    if (filteredData.length > 0) {
      const sourceFile = filteredData[0].sourceFile;
      const finalLink = finalSolutionLinks[sourceFile];
      if (finalLink) {
        finalLinkElement.href = finalLink;
        finalLinkElement.style.display = 'inline-block';
      } else {
        finalLinkElement.style.display = 'none';
      }
    }
  } else {
    sumOfCodesContainer.style.display = 'none';
  }

  const solvedPercentage = totalImages > 0 ? ((solvedCount / totalImages) * 100).toFixed(2) : "0.00";
  const listenedPercentage = totalImages > 0 ? ((listenedCount / totalImages) * 100).toFixed(2) : "0.00";
  
  document.getElementById('solved-percentage').textContent = `${solvedPercentage}%`;
  // TODO: Rename field
  document.getElementById('solved-percentage-batch').textContent = `${solvedCountBatch} / ${totalImagesBatch}`;
  document.getElementById('listened-percentage').textContent = `${listenedPercentage}%`;
}

function updateCountDisplay() {
  const countDisplay = document.getElementById('count-display');
  const selectedSource = document.getElementById('source-select').value;
  
  if (selectedSource) {
    countDisplay.textContent = ``;
  } else {
    countDisplay.textContent = `(Please select a source file)`;
  }
}

function downloadStateAsCSV() {
  // Create CSV content with header
  let csvContent = 'Image Link,Certitude Link,Source,Status,Band Name,Notes,Listened,Code\n';
  
  // Process all data, not just filtered data
  allData.forEach(item => {
    const state = getImageState(item.image);
    
    // Escape CSV values that contain commas or quotes
    const escapeCSV = (value) => {
      if (!value) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };
    
    const row = [
      escapeCSV(item.image),
      escapeCSV(item.certitude),
      escapeCSV(item.sourceFile),
      escapeCSV(state.status),
      escapeCSV(state.band),
      escapeCSV(state.note),
      state.listened ? 'Yes' : 'No',
      escapeCSV(state.code),
    ].join(',');
    
    csvContent += row + '\n';
  });
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `band-quiz-state-${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function renderImages() {
  const container = document.getElementById('image-container');
  const display = document.getElementById('large-image-display');
  
  // Hide large image display when switching source files
  display.classList.remove('show');
  currentLargeImageUrl = '';
  
  // Ensure the large image display is moved back to its original position
  // before clearing the container
  const body = document.body;
  if (!body.contains(display) || container.contains(display)) {
    // Remove from current position and append to body temporarily
    display.remove();
    body.appendChild(display);
  }
  
  container.innerHTML = '';
  
  let counter = 0;
  for (const item of filteredData) {
    counter = counter + 1;
    const imageItem = document.createElement('div');
    imageItem.className = 'image-item';
    
    const state = getImageState(item.image);
    imageItem.classList.add(state.status);
    
    const bandName = state.band || '?';
    
    imageItem.innerHTML = `
      <img src="${item.image}" alt="Band image" loading="lazy" data-image="${item.image}">
      <div class="info">
        <div><strong>#</strong></div>
        <div><strong>Artist:</strong> ${bandName}</div>
        <div><strong>Code:</strong> ${state.code || '?'}</div>
        <div><a href="${item.certitude}" target="_blank" class="certitude-link">Certitude Link</a> | <span title="Listened status">${state.listened ? '🔈' : '🔇'}</span></div>
      </div>
    `;
    
    // Add click handler to show large image
    imageItem.addEventListener('click', () => showLargeImage(item));
    
    container.appendChild(imageItem);
  }
}

async function loadData() {
  try {
    // Load CSV data, bands data, and final solution links
    const [csvResponse, finalLinksResponse] = await Promise.all([
      fetch("data.csv"),
      fetch("final_sol_links.csv"),
      loadBandsData()
    ]);
    
    if (!csvResponse.ok) {
      throw new Error(`HTTP ${csvResponse.status}`);
    }

    const csvText = await csvResponse.text();
    allData = parseCSV(csvText);
    
    // Load final solution links if available
    if (finalLinksResponse.ok) {
      const finalLinksText = await finalLinksResponse.text();
      finalSolutionLinks = parseFinalSolutionLinksCSV(finalLinksText);
      console.log(`Loaded ${Object.keys(finalSolutionLinks).length} final solution links`);
    }
    filteredData = [];

    // Load saved image states
    loadImageStates();
    
    // Setup large image controls
    setupLargeImageControls();

    document.getElementById("status").textContent = 
      `Loaded ${allData.length} images from CSV and ${bandsData.length} bands`;
    
    populateSourceDropdown();
    updateCountDisplay();
    updateStatistics(); // Initialize statistics display
    
    // Setup download button
    document.getElementById('download-csv').addEventListener('click', downloadStateAsCSV);

  } catch (err) {
    document.getElementById("status").textContent = 
      "Failed to load data files";
    console.error(err);
  }
}

loadData();
