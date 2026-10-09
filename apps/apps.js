const lookupURL = 'https://itunes.apple.com/lookup?id=1355340766&entity=software';
const developerURL = 'https://apps.apple.com/us/developer/xavi-moll/id1355340766';
// Roughly two lines at full width. CSS clamps the lines; this keeps narrower layouts showing a similar amount of text.
const descriptionLimit = 180;

function truncate(text, limit) {
    const clean = text.replace(/\s+/g, ' ').trim();
    if (clean.length <= limit) {
        return clean;
    }
    const cut = clean.slice(0, limit - 1);
    const lastSpace = cut.lastIndexOf(' ');
    const trimmed = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
    return trimmed.replace(/[\s.,;:!?\-–—]+$/, '') + '…';
}

function formatDate(isoString) {
    return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function formatMonth(isoString) {
    return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
    });
}

function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) {
        node.className = className;
    }
    if (text) {
        node.textContent = text;
    }
    return node;
}

function platforms(app) {
    const devices = app.supportedDevices || [];
    const features = app.features || [];
    const supports = prefix => devices.some(device => device.startsWith(prefix));

    const result = [];
    if (supports('iPhone') || supports('iPod')) {
        result.push('iPhone');
    }
    if (features.includes('iosUniversal')) {
        result.push('iPad');
    }
    if (supports('MacDesktop')) {
        result.push('Mac');
    }
    if (supports('Watch')) {
        result.push('Apple Watch');
    }
    if (supports('AppleTV')) {
        result.push('Apple TV');
    }
    if (supports('AppleVision')) {
        result.push('Vision Pro');
    }
    return result;
}

function ratingElement(app) {
    const rating = element('span', 'meta-item rating');
    if (!app.userRatingCount) {
        rating.textContent = 'No ratings yet';
        return rating;
    }

    const stars = element('span', 'stars');
    stars.style.setProperty('--rating', app.averageUserRating);
    rating.appendChild(stars);
    rating.appendChild(element('span', 'rating-value', app.averageUserRating.toFixed(1)));
    return rating;
}

function releasesText(app) {
    // Non-breaking spaces keep the date and version together when the line wraps.
    const lastUpdate = (formatDate(app.currentVersionReleaseDate) + ' (v' + app.version + ')').replace(/ /g, '\u00a0');
    if (!app.releaseDate) {
        return 'Last update on ' + lastUpdate;
    }
    return 'Launched in ' + formatMonth(app.releaseDate) + ', last update on ' + lastUpdate;
}

function appRow(app, index) {
    const row = element('a', 'app-row');
    row.href = app.trackViewUrl;
    row.target = '_blank';
    row.style.animationDelay = (index * 70) + 'ms';

    const icon = element('img', 'app-icon');
    icon.src = app.artworkUrl512;
    icon.alt = app.trackName + ' icon';

    const info = element('div', 'app-info');
    const title = element('div', 'app-title');
    title.appendChild(element('h3', 'app-name', app.trackName));
    platforms(app).forEach(platform => {
        title.appendChild(element('span', 'platform', platform));
    });
    info.appendChild(title);
    info.appendChild(element('p', 'app-description', truncate(app.description, descriptionLimit)));

    const meta = element('div', 'app-meta');
    meta.appendChild(ratingElement(app));
    meta.appendChild(element('span', 'meta-item releases', releasesText(app)));
    info.appendChild(meta);

    row.appendChild(icon);
    row.appendChild(info);
    row.appendChild(element('span', 'view-button', 'VIEW'));
    return row;
}

function showError(list) {
    const message = element('p', 'apps-error', 'Couldn\'t load the apps right now. ');
    const link = element('a', null, 'See them on the App Store');
    link.href = developerURL;
    link.target = '_blank';
    message.appendChild(link);
    message.appendChild(document.createTextNode('.'));
    list.replaceChildren(message);
}

async function loadApps() {
    const list = document.getElementById('apps-list');
    try {
        const response = await fetch(lookupURL);
        if (!response.ok) {
            throw new Error('Unexpected status ' + response.status);
        }
        const json = await response.json();
        const apps = json.results
            .filter(result => result.wrapperType === 'software')
            .sort((a, b) => new Date(b.currentVersionReleaseDate) - new Date(a.currentVersionReleaseDate));

        list.replaceChildren(...apps.map(appRow));
        list.classList.remove('loading');
    } catch (error) {
        console.error(error);
        list.classList.remove('loading');
        showError(list);
    }
}

loadApps();
