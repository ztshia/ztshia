let postsData = [];
let currentDisplayCount = 0;
const increment = 30;

document.addEventListener('DOMContentLoaded', () => {
    fetch('https://life.upstairs.cn/api/memo?creatorId=101&limit=108')
        .then(response => response.json())
        .then(data => {
            postsData = data.data;
            loadMore();
            window.addEventListener('scroll', handleScroll);
        })
        .catch(error => console.error('Error fetching the API data:', error));
});

function showTab(tab) {
    document.querySelector('.tab-button.active').classList.remove('active');
    document.querySelector(`.tab-button[onclick="showTab('${tab}')"]`).classList.add('active');
    document.querySelector('.posts').style.display = tab === 'posts' ? 'block' : 'none';
    document.querySelector('.media').style.display = tab === 'media' ? 'flex' : 'none';
}

function linkifyText(text) {
    const urlRegex = /(\b(http?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, function(url) {
        return `<a href="${url}" target="_blank">${url}</a>`;
    });
}

function replaceDomain(url) {
    const urlObj = new URL(url);
    urlObj.hostname = '365.upstairs.cn';
    return urlObj.toString();
}

function parseMarkdown(content) {
    // Use marked library to parse Markdown to HTML
    return marked.parse(content);
}

function openLinksInNewTab(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const links = tempDiv.querySelectorAll('a');
    links.forEach(link => {
        link.setAttribute('target', '_blank');
    });
    return tempDiv.innerHTML;
}

function loadMore() {
    const postsContainer = document.getElementById('posts');
    const mediaContainer = document.getElementById('media');

    const newPosts = postsData.slice(currentDisplayCount, currentDisplayCount + increment);
    newPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        // Convert hashtags to spans before processing markdown
        let markdownContent = post.content;

        postElement.innerHTML = `
            <div class="content">
                <p class="date">
                    <a href="https://life.upstairs.cn/m/${post.id}" target="_blank">${moment.unix(post.createdTs).twitter()}</a>
                </p>
                ${openLinksInNewTab(parseMarkdown(markdownContent))}
                ${post.resourceList && post.resourceList.length > 0 ? 
                  `<div class="images">${post.resourceList.map(resource => `<a href="${replaceDomain(resource.externalLink)}" target="_blank"><img src="${replaceDomain(resource.externalLink)}" alt="Post Image"></a>`).join('')}</div>` : ''}
            </div>
        `;

        postsContainer.appendChild(postElement);

        if (post.resourceList && post.resourceList.length > 0) {
            post.resourceList.forEach(resource => {
                const mediaElement = document.createElement('a');
                mediaElement.href = replaceDomain(resource.externalLink);
                mediaElement.target = "_blank";
                mediaElement.innerHTML = `<img src="${replaceDomain(resource.externalLink)}" alt="Media Image">`;
                mediaContainer.appendChild(mediaElement);
            });
        }
    });

    currentDisplayCount += increment;

    adjustMediaLayout();

    if (currentDisplayCount >= postsData.length) {
        document.getElementById('load-more').style.display = 'none';
        window.removeEventListener('scroll', handleScroll);
    }
}

function adjustMediaLayout() {
    const mediaContainer = document.getElementById('media');
    const mediaItems = Array.from(mediaContainer.children);

    mediaItems.forEach(item => item.style.flex = '1 1 calc(25% - 10px)');

    const totalItems = mediaItems.length;
    const remainder = totalItems % 4;

    if (remainder !== 0) {
        const lastRowStartIndex = totalItems - remainder;
        for (let i = lastRowStartIndex; i < totalItems; i++) {
            mediaItems[i].style.flex = '1 1 calc(33.333% - 10px)';
        }
    }
}

function handleScroll() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        loadMore();
    }
}
