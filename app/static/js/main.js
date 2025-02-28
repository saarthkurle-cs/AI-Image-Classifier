document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('file-input');
    const submitBtn = document.getElementById('submit-btn');
    const previewContainer = document.getElementById('preview-container');
    const imagePreview = document.getElementById('image-preview');
    const removeImageBtn = document.getElementById('remove-image');
    const fileLabel = document.querySelector('.file-label');
    
    // Handle file selection
    fileInput.addEventListener('change', function() {
        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            
            // Check if file is an image
            if (!file.type.match('image.*')) {
                alert('Please select an image file (jpg, jpeg, or png)');
                return;
            }
            
            // Display preview
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                fileLabel.style.display = 'none';
                previewContainer.classList.remove('hidden');
                submitBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Handle drag and drop
    const dropArea = document.querySelector('.file-input-container');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        fileLabel.style.borderColor = '#44c7f4';
    }
    
    function unhighlight() {
        fileLabel.style.borderColor = '#ccc';
    }
    
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files && files[0]) {
            fileInput.files = files;
            
            // Trigger change event
            const event = new Event('change');
            fileInput.dispatchEvent(event);
        }
    }
    
    // Remove image
    removeImageBtn.addEventListener('click', function() {
        imagePreview.src = '#';
        fileInput.value = '';
        previewContainer.classList.add('hidden');
        fileLabel.style.display = 'flex';
        submitBtn.disabled = true;
    });
});