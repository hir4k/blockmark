export class YouTube {
    // Static metadata for block registry
    static type = 'youtube';
    static name = 'YouTube Video';
    static icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#ffffff"/></svg>`;
    static defaultData = { url: '' };

    constructor({ data = {}, onEnter, onBackspace }) {
        this.data = { url: data.url || '' };
        this.onEnter = onEnter;
        this.onBackspace = onBackspace;
        this.element = document.createElement('div');
        this.element.className = 'youtube-block';
        this.element.setAttribute('data-block-type', 'youtube');
        this.element.contentEditable = false;
    }

    render() {
        this.element.innerHTML = '';

        // Create container
        const container = document.createElement('div');
        container.style.cssText = `
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            margin: 8px 0;
            background: white;
        `;

        if (!this.data.url) {
            // Show URL input
            this._renderUrlInput(container);
        } else {
            // Show embedded video
            this._renderVideo(container);
        }

        this.element.appendChild(container);
        return this.element;
    }

    _renderUrlInput(container) {
        // Create input section
        const inputSection = document.createElement('div');
        inputSection.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 12px;
        `;

        // Create label
        const label = document.createElement('label');
        label.textContent = 'YouTube Video URL';
        label.style.cssText = `
            font-weight: 500;
            color: #374151;
            font-size: 14px;
        `;

        // Create input container
        const inputContainer = document.createElement('div');
        inputContainer.style.cssText = `
            display: flex;
            gap: 8px;
            align-items: center;
        `;

        // Create input field
        const input = document.createElement('input');
        input.type = 'url';
        input.placeholder = 'https://www.youtube.com/watch?v=...';
        input.value = this.data.url;
        input.style.cssText = `
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
        `;

        // Focus effect
        input.addEventListener('focus', () => {
            input.style.borderColor = '#3b82f6';
        });

        input.addEventListener('blur', () => {
            input.style.borderColor = '#d1d5db';
        });

        // Create embed button
        const embedBtn = document.createElement('button');
        embedBtn.textContent = 'Embed';
        embedBtn.style.cssText = `
            padding: 8px 16px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background-color 0.2s;
        `;

        embedBtn.addEventListener('mouseover', () => {
            embedBtn.style.background = '#2563eb';
        });

        embedBtn.addEventListener('mouseout', () => {
            embedBtn.style.background = '#3b82f6';
        });

        // Handle embed button click
        embedBtn.addEventListener('click', () => {
            const url = input.value.trim();
            if (this._isValidYouTubeUrl(url)) {
                this.data.url = url;
                this.render();
            } else {
                this._showError(input, 'Please enter a valid YouTube URL');
            }
        });

        // Handle Enter key
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                embedBtn.click();
            }
        });

        // Handle Backspace on empty input
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value) {
                e.preventDefault();
                this.onBackspace?.();
            }
        });

        // Append elements
        inputContainer.appendChild(input);
        inputContainer.appendChild(embedBtn);
        inputSection.appendChild(label);
        inputSection.appendChild(inputContainer);

        // Add help text
        const helpText = document.createElement('p');
        helpText.textContent = 'Paste a YouTube video URL to embed it';
        helpText.style.cssText = `
            margin: 0;
            font-size: 12px;
            color: #6b7280;
        `;
        inputSection.appendChild(helpText);

        container.appendChild(inputSection);

        // Focus the input
        setTimeout(() => input.focus(), 0);
    }

    _renderVideo(container) {
        // Create video container
        const videoContainer = document.createElement('div');
        videoContainer.style.cssText = `
            position: relative;
            width: 100%;
            max-width: 640px;
            margin: 0 auto;
        `;

        // Create iframe
        const iframe = document.createElement('iframe');
        const videoId = this._extractVideoId(this.data.url);
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.style.cssText = `
            width: 100%;
            height: 360px;
            border: none;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        `;
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');

        // Create controls
        const controls = document.createElement('div');
        controls.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 12px;
            padding: 8px 0;
        `;

        // URL display
        const urlDisplay = document.createElement('div');
        urlDisplay.textContent = this.data.url;
        urlDisplay.style.cssText = `
            font-size: 12px;
            color: #6b7280;
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            margin-right: 12px;
        `;

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.style.cssText = `
            padding: 4px 8px;
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            color: #374151;
            transition: background-color 0.2s;
        `;

        editBtn.addEventListener('mouseover', () => {
            editBtn.style.background = '#e5e7eb';
        });

        editBtn.addEventListener('mouseout', () => {
            editBtn.style.background = '#f3f4f6';
        });

        editBtn.addEventListener('click', () => {
            this.data.url = '';
            this.render();
        });

        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.style.cssText = `
            padding: 4px 8px;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            color: #dc2626;
            margin-left: 8px;
            transition: background-color 0.2s;
        `;

        removeBtn.addEventListener('mouseover', () => {
            removeBtn.style.background = '#fee2e2';
        });

        removeBtn.addEventListener('mouseout', () => {
            removeBtn.style.background = '#fef2f2';
        });

        removeBtn.addEventListener('click', () => {
            this.onBackspace?.();
        });

        // Append elements
        videoContainer.appendChild(iframe);
        controls.appendChild(urlDisplay);
        controls.appendChild(editBtn);
        controls.appendChild(removeBtn);
        container.appendChild(videoContainer);
        container.appendChild(controls);
    }

    _isValidYouTubeUrl(url) {
        const patterns = [
            /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/,
            /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
            /^(https?:\/\/)?(www\.)?youtu\.be\/[\w-]+/
        ];

        return patterns.some(pattern => pattern.test(url));
    }

    _extractVideoId(url) {
        // Handle youtu.be URLs
        if (url.includes('youtu.be/')) {
            return url.split('youtu.be/')[1].split('?')[0];
        }

        // Handle youtube.com URLs
        if (url.includes('youtube.com/watch')) {
            const urlParams = new URLSearchParams(url.split('?')[1]);
            return urlParams.get('v');
        }

        return '';
    }

    _showError(input, message) {
        // Create error message
        const error = document.createElement('div');
        error.textContent = message;
        error.style.cssText = `
            color: #dc2626;
            font-size: 12px;
            margin-top: 4px;
        `;

        // Add error styling to input
        input.style.borderColor = '#dc2626';

        // Insert error after input container
        const inputContainer = input.parentElement;
        inputContainer.parentElement.appendChild(error);

        // Remove error after 3 seconds
        setTimeout(() => {
            error.remove();
            input.style.borderColor = '#d1d5db';
        }, 3000);
    }

    save() {
        return {
            type: 'youtube',
            url: this.data.url
        };
    }
} 