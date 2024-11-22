function parseSitemap(sitemap) {
    try {
        // Trim whitespace and remove any leading/trailing line breaks
        sitemap = sitemap.trim();

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(sitemap, "application/xml");
    
        // Check for parsing errors
        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
            throw new Error('Invalid XML format.');
        }

        const urls = xmlDoc.getElementsByTagName("loc");
        const urlList = [];

        for (let loc of urls) {
            const url = loc.textContent;
            const structuredUrl = formatUrl(url);
            urlList.push(structuredUrl);
        }

        return urlList;
    } catch (error) {
        console.error('Sitemap parsing error:', error);
        throw error;
    }
}

function formatUrl(url) {
    try {
        // Ensure the URL has a protocol
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        // Return the full, normalized URL
        return new URL(url).href;
    } catch (error) {
        console.warn('URL formatting error:', error);
        return url;
    }
}

function createUrlSelect(urlList) {
    const urlSelect = document.getElementById('urlSelect');
    urlSelect.innerHTML = ''; // Clear previous options

    // Sort URLs
    const sortedUrls = urlList.sort();

    // Add numbered URLs to the select element
    sortedUrls.forEach((url, index) => {
        const option = document.createElement('option');
        option.value = url;
        option.textContent = `${index + 1}. ${url}`;
        urlSelect.appendChild(option);
    });

    // Add click event to copy URL
    urlSelect.onclick = copySelectedUrl;
}

function copySelectedUrl() {
    const urlSelect = document.getElementById('urlSelect');
    const selectedOption = urlSelect.options[urlSelect.selectedIndex];
    
    if (selectedOption) {
        const urlToCopy = selectedOption.value;
        
        // Create a temporary textarea to copy the text
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = urlToCopy;
        document.body.appendChild(tempTextArea);
        
        // Select and copy the text
        tempTextArea.select();
        document.execCommand('copy');
        
        // Remove the temporary textarea
        document.body.removeChild(tempTextArea);
        
        // Optional: Show a small tooltip or alert
        alert(`URL copiada: ${urlToCopy}`);
    }
}

function processSitemap() {
    const sitemapInput = document.getElementById('sitemapInput');
    const totalCount = document.getElementById('totalCount');
    const accordionContent = document.querySelector('.accordion-content');

    try {
        const sitemapText = sitemapInput.value;
        
        // Validate input not empty
        if (!sitemapText.trim()) {
            alert('Por favor, ingrese un XML de sitemap.');
            return;
        }

        const urlList = parseSitemap(sitemapText);
        
        // Reset input style
        sitemapInput.style.borderColor = 'var(--border-color)';
        
        // Open accordion if not already open
        accordionContent.classList.add('active');
        document.querySelector('.toggle-icon').style.transform = 'rotate(180deg)';

        if (urlList.length > 0) {
            createUrlSelect(urlList);
            totalCount.textContent = `Total de URLs: ${urlList.length}`;
        } else {
            totalCount.textContent = 'No se encontraron URLs.';
        }
    } catch (error) {
        // Improve error handling
        let errorMessage = 'Error al procesar el XML';
        if (error.message) {
            errorMessage += `: ${error.message}`;
        }
        
        // Highlight input with red border
        sitemapInput.style.borderColor = 'red';
        
        // Show more informative alert
        alert(errorMessage + '\n\nPor favor, verifique el formato del sitemap XML.');
        
        // Clear results
        document.getElementById('urlSelect').innerHTML = '';
        totalCount.textContent = '';
    }
}

function toggleAccordion() {
    const accordionContent = document.querySelector('.accordion-content');
    const toggleIcon = document.querySelector('.toggle-icon');
    
    accordionContent.classList.toggle('active');
    
    // Rotate toggle icon
    if (accordionContent.classList.contains('active')) {
        toggleIcon.style.transform = 'rotate(180deg)';
    } else {
        toggleIcon.style.transform = 'rotate(0deg)';
    }
}

function clearInput() {
    document.getElementById('sitemapInput').value = '';
    document.getElementById('urlSelect').innerHTML = '';
    document.getElementById('totalCount').textContent = '';
    
    // Reset input border
    document.getElementById('sitemapInput').style.borderColor = 'var(--border-color)';
    
    // Close accordion
    const accordionContent = document.querySelector('.accordion-content');
    accordionContent.classList.remove('active');
    document.querySelector('.toggle-icon').style.transform = 'rotate(0deg)';
}

function exportUrls(format = 'txt') {
    const urlSelect = document.getElementById('urlSelect');
    const urls = Array.from(urlSelect.options).map(option => option.value);

    if (urls.length === 0) {
        alert('No hay URLs para exportar.');
        return;
    }

    if (format === 'txt') {
        // Text file export
        const urlsText = urls.join('\n');
        const blob = new Blob([urlsText], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'listado_urls.txt';
        a.click();
    } else if (format === 'xlsx') {
        // Excel export
        const worksheet = XLSX.utils.aoa_to_sheet(urls.map((url, index) => [index + 1, url]));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'URLs');
        XLSX.writeFile(workbook, 'listado_urls.xlsx');
    }
}