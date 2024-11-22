function parseSitemap(sitemap) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(sitemap, "application/xml");
    const urls = xmlDoc.getElementsByTagName("loc");
    const urlList = [];

    for (let loc of urls) {
        const url = loc.textContent;
        const structuredUrl = formatUrl(url);
        urlList.push(structuredUrl);
    }

    return urlList;
}

function formatUrl(url) {
    const urlParts = url.split('/').filter(part => part);
    const structuredUrl = urlParts.join('/');
    const endsWithSlash = url.endsWith('/');
    return endsWithSlash ? `${structuredUrl}/` : structuredUrl;
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
}

function processSitemap() {
    const sitemapInput = document.getElementById('sitemapInput').value;
    const urlList = parseSitemap(sitemapInput);
    const totalCount = document.getElementById('totalCount');
    const accordionContent = document.querySelector('.accordion-content');

    // Open accordion if not already open
    accordionContent.classList.add('active');
    document.querySelector('.toggle-icon').style.transform = 'rotate(180deg)';

    if (urlList.length > 0) {
        createUrlSelect(urlList);
        totalCount.textContent = `Total de URLs: ${urlList.length}`;
    } else {
        totalCount.textContent = 'No se encontraron URLs.';
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

// Optional: Initialize anything needed when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load SheetJS library dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.5/xlsx.full.min.js';
    document.head.appendChild(script);
});