export class Image {
    // Static metadata for block registry
    static type = 'image';
    static name = 'Image';
    static icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="#ffffff" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="#ffffff"/><polyline points="21,15 16,10 5,21" stroke="#ffffff" stroke-width="2"/></svg>`;
    static defaultData = {
        src: '',
        alt: '',
        caption: '',
        width: 'auto',
        height: 'auto'
    };

    constructor({ data = {}, onEnter, onBackspace, uploadFunction = null }) {
        this.data = {
            src: data.src || '',
            alt: data.alt || '',
            caption: data.caption || '',
            width: data.width || 'auto',
            height: data.height || 'auto'
        };
        this.onEnter = onEnter;
        this.onBackspace = onBackspace;
        this.uploadFunction = uploadFunction;
        this.element = document.createElement('div');
        this.element.className = 'image-block';
        this.element.setAttribute('data-block-type', 'image');
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

        if (!this.data.src) {
            // Show upload interface
            this._renderUploadInterface(container);
        } else {
            // Show image with controls
            this._renderImage(container);
        }

        this.element.appendChild(container);
        return this.element;
    }

    _renderUploadInterface(container) {
        // Create upload section
        const uploadSection = document.createElement('div');
        uploadSection.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 16px;
            align-items: center;
            padding: 20px;
            border: 2px dashed #cbd5e1;
            border-radius: 8px;
            background: #f8fafc;
        `;

        // Create upload icon
        const uploadIcon = document.createElement('div');
        uploadIcon.innerHTML = `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="#94a3b8"/>
            </svg>
        `;
        uploadIcon.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        // Create upload text
        const uploadText = document.createElement('div');
        uploadText.style.cssText = `
            text-align: center;
            color: #64748b;
        `;
        uploadText.innerHTML = `
            <div style="font-size: 16px; font-weight: 500; margin-bottom: 4px;">Upload an image</div>
            <div style="font-size: 14px;">Click to browse or drag and drop</div>
        `;

        // Create file input (hidden)
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.cssText = `
            display: none;
        `;

        // Create upload button
        const uploadButton = document.createElement('button');
        uploadButton.textContent = 'Choose Image';
        uploadButton.style.cssText = `
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

        uploadButton.addEventListener('mouseover', () => {
            uploadButton.style.background = '#2563eb';
        });

        uploadButton.addEventListener('mouseout', () => {
            uploadButton.style.background = '#3b82f6';
        });

        // Handle file selection
        const handleFileSelect = (file) => {
            if (file && file.type.startsWith('image/')) {
                this._processImageFile(file);
            } else {
                this._showError('Please select a valid image file.');
            }
        };

        // File input change handler
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            handleFileSelect(file);
        });

        // Upload button click handler
        uploadButton.addEventListener('click', () => {
            fileInput.click();
        });

        // Drag and drop handlers
        uploadSection.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadSection.style.borderColor = '#3b82f6';
            uploadSection.style.background = '#eff6ff';
        });

        uploadSection.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadSection.style.borderColor = '#cbd5e1';
            uploadSection.style.background = '#f8fafc';
        });

        uploadSection.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadSection.style.borderColor = '#cbd5e1';
            uploadSection.style.background = '#f8fafc';

            const file = e.dataTransfer.files[0];
            handleFileSelect(file);
        });

        // Handle Backspace on empty upload area
        uploadSection.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                e.preventDefault();
                this.onBackspace?.();
            }
        });

        // Append elements
        uploadSection.appendChild(uploadIcon);
        uploadSection.appendChild(uploadText);
        uploadSection.appendChild(uploadButton);
        container.appendChild(uploadSection);
        container.appendChild(fileInput);
    }

    _processImageFile(file) {
        // Show loading state
        this._showLoading();

        // If no upload function is provided, show error
        if (!this.uploadFunction) {
            this._hideLoading();
            this._showError('No upload function configured. Please set up image upload.');
            return;
        }

        // Call the custom upload function
        try {
            const uploadPromise = this.uploadFunction(file);

            if (uploadPromise && typeof uploadPromise.then === 'function') {
                // Handle Promise-based upload function
                uploadPromise
                    .then(imageUrl => {
                        if (imageUrl && typeof imageUrl === 'string') {
                            this.data.src = imageUrl;
                            this.data.alt = file.name;
                            this._hideLoading();
                            this.render();
                        } else {
                            throw new Error('Upload function must return a valid image URL');
                        }
                    })
                    .catch(error => {
                        this._hideLoading();
                        this._showError(error.message || 'Upload failed');
                    });
            } else {
                // Handle synchronous upload function
                const imageUrl = uploadPromise;
                if (imageUrl && typeof imageUrl === 'string') {
                    this.data.src = imageUrl;
                    this.data.alt = file.name;
                    this._hideLoading();
                    this.render();
                } else {
                    this._hideLoading();
                    this._showError('Upload function must return a valid image URL');
                }
            }
        } catch (error) {
            this._hideLoading();
            this._showError(error.message || 'Upload function error');
        }
    }

    _renderImage(container) {
        // Create image container
        const imageContainer = document.createElement('div');
        imageContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 12px;
        `;

        // Create image element
        const img = document.createElement('img');
        img.src = this.data.src;
        img.alt = this.data.alt;
        img.style.cssText = `
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        `;

        // Create caption input
        const captionInput = document.createElement('input');
        captionInput.type = 'text';
        captionInput.placeholder = 'Add a caption (optional)';
        captionInput.value = this.data.caption;
        captionInput.style.cssText = `
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
        `;

        captionInput.addEventListener('focus', () => {
            captionInput.style.borderColor = '#3b82f6';
        });

        captionInput.addEventListener('blur', () => {
            captionInput.style.borderColor = '#d1d5db';
        });

        captionInput.addEventListener('input', () => {
            this.data.caption = captionInput.value;
        });

        // Create controls
        const controls = document.createElement('div');
        controls.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
        `;

        // Alt text input
        const altInput = document.createElement('input');
        altInput.type = 'text';
        altInput.placeholder = 'Alt text for accessibility';
        altInput.value = this.data.alt;
        altInput.style.cssText = `
            flex: 1;
            padding: 4px 8px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 12px;
            outline: none;
            margin-right: 8px;
        `;

        altInput.addEventListener('input', () => {
            this.data.alt = altInput.value;
            img.alt = altInput.value;
        });

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Replace';
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
            this.data.src = '';
            this.data.alt = '';
            this.data.caption = '';
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
        imageContainer.appendChild(img);
        if (this.data.caption) {
            const caption = document.createElement('div');
            caption.textContent = this.data.caption;
            caption.style.cssText = `
                font-size: 14px;
                color: #6b7280;
                text-align: center;
                font-style: italic;
            `;
            imageContainer.appendChild(caption);
        }
        imageContainer.appendChild(captionInput);

        controls.appendChild(altInput);
        controls.appendChild(editBtn);
        controls.appendChild(removeBtn);

        container.appendChild(imageContainer);
        container.appendChild(controls);
    }

    _showError(message) {
        // Create error message
        const error = document.createElement('div');
        error.textContent = message;
        error.style.cssText = `
            color: #dc2626;
            font-size: 12px;
            margin-top: 8px;
            text-align: center;
        `;

        // Insert error into container
        const container = this.element.querySelector('div');
        container.appendChild(error);

        // Remove error after 3 seconds
        setTimeout(() => {
            error.remove();
        }, 3000);
    }

    _showLoading() {
        // Remove any existing loading indicator
        this._hideLoading();

        // Create loading indicator
        const loading = document.createElement('div');
        loading.className = 'image-upload-loading';
        loading.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 16px;
            color: #64748b;
            font-size: 14px;
        `;
        loading.innerHTML = `
            <div class="spinner" style="
                width: 16px;
                height: 16px;
                border: 2px solid #e2e8f0;
                border-top: 2px solid #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            "></div>
            <span>Uploading image...</span>
        `;

        // Add CSS animation if not already present
        if (!document.querySelector('#image-upload-styles')) {
            const style = document.createElement('style');
            style.id = 'image-upload-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }

        // Insert loading into container
        const container = this.element.querySelector('div');
        container.appendChild(loading);
    }

    _hideLoading() {
        const loading = this.element.querySelector('.image-upload-loading');
        if (loading) {
            loading.remove();
        }
    }

    save() {
        return {
            type: 'image',
            src: this.data.src,
            alt: this.data.alt,
            caption: this.data.caption,
            width: this.data.width,
            height: this.data.height
        };
    }
} 