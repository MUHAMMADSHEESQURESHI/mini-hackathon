// =================================================================
//                 AUTHENTICATION AND CONFIGURATION
// =================================================================

const LOGGED_IN_KEY = 'loggedInUser';
const POSTS_STORAGE_KEY = 'socialFeedPosts'; // Key for storing posts
const redirectToFeed = () => {
    setTimeout(() => {
        // Assuming your feed page is named 'feed.html'
        window.location.href = 'feed.html'; 
    }, 500);
};

// --- Helper Functions for Posts ---
const loadPosts = () => {
    const postsJson = localStorage.getItem(POSTS_STORAGE_KEY);
    // Parse posts, ensuring 'date' is reconstructed from the string property
    return postsJson ? JSON.parse(postsJson).map(post => ({
        ...post,
        date: new Date(post.date)
    })) : [];
};

const savePosts = (postsArray) => {
    // Before saving, ensure the posts array is converted to JSON string
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(postsArray));
};

const getTimeStamp = () => {
    return new Date().toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        month: 'short',
        day: 'numeric'
    });
};

// Array to store post objects (loaded from storage on start)
let posts = loadPosts();

// =================================================================
//                 AUTHENTICATION HANDLER FUNCTIONS
// =================================================================

function handleSignup(event) {
    event.preventDefault();

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageElement = document.getElementById('message');

    if (!nameInput || !emailInput || !passwordInput || !messageElement) return;

    const name = nameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!name || !email || !password) {
        messageElement.className = 'mt-4 text-red-500 text-center';
        messageElement.textContent = 'Please fill out all fields.';
        return;
    }

    if (localStorage.getItem(email)) {
        messageElement.className = 'mt-4 text-red-500 text-center';
        messageElement.textContent = 'User with this email already exists!';
        return;
    }

    const user = { name, email, password };
    localStorage.setItem(email, JSON.stringify(user));

    // Log the user in and redirect
    localStorage.setItem(LOGGED_IN_KEY, JSON.stringify({ name: user.name, email: user.email }));

    messageElement.className = 'mt-4 text-green-500 text-center';
    messageElement.textContent = 'Registration successful! Redirecting...';
    
    redirectToFeed();
}

function handleLogin(event) {
    event.preventDefault();

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageElement = document.getElementById('message');

    if (!emailInput || !passwordInput || !messageElement) return;

    const email = emailInput.value;
    const password = passwordInput.value;

    const userJson = localStorage.getItem(email);

    if (!userJson) {
        messageElement.className = 'mt-4 text-red-500 text-center';
        messageElement.textContent = 'Login failed: Invalid email or password.';
        return;
    }

    const user = JSON.parse(userJson);

    if (user.password === password) {
        // Successful login: set session data
        localStorage.setItem(LOGGED_IN_KEY, JSON.stringify({ name: user.name, email: user.email }));

        messageElement.className = 'mt-4 text-green-500 text-center';
        messageElement.textContent = 'Login successful! Redirecting...';
        
        redirectToFeed();
    } else {
        // Password mismatch
        messageElement.className = 'mt-4 text-red-500 text-center';
        messageElement.textContent = 'Login failed: Invalid email or password.';
    }
}


// =================================================================
//                       POST RENDERING LOGIC (FIXED)
// =================================================================

/**
 * Creates the HTML string for a single post item.
 * @param {object} post - The post data object.
 * @returns {string} The HTML string.
 */
const createPostElement = (post) => {
    // MISTAKE 1 FIXED: Active like button changed from 'hover:bg-red-600' to fuchsia-700 for consistency.
    const likeButtonClass = post.isLiked 
        ? 'bg-fuchsia-600 text-white hover:bg-fuchsia-700' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    
    const user = JSON.parse(localStorage.getItem(LOGGED_IN_KEY));
    const userName = user ? user.name : 'Guest User';

    return `
        <div class="post-item bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100" data-id="${post.id}" data-likes="${post.likes}">
            <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center">
                        <div class="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold mr-3 flex-shrink-0">${userName.charAt(0)}</div>
                        <div>
                            <p class="text-md font-semibold text-gray-900">${userName}</p>
                            <p class="text-xs text-gray-500">${post.timestamp}</p>
                        </div>
                    </div>
                    <button data-action="delete" class="text-gray-400 hover:text-red-500 transition duration-150">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>

                ${post.imageUrl ? `
                    <div class="mb-4">
                        <img class="w-full h-auto object-cover rounded-lg max-h-80" 
                             src="${post.imageUrl}" 
                             alt="Post image" 
                             onerror="this.onerror=null;this.src='https://via.placeholder.com/600x300.png?text=Invalid+Image+URL';this.classList.add('p-4','bg-gray-200')">
                    </div>
                ` : ''}

                <p class="text-gray-800 leading-relaxed mb-4">${post.content.replace(/\n/g, '<br>')}</p>

                <div class="flex justify-between items-center text-sm mt-4 border-t pt-4">
                    <button data-action="like" class="flex items-center px-4 py-1 rounded-full font-medium transition duration-150 ${likeButtonClass}">
                        <svg class="w-5 h-5 mr-1" fill="${post.isLiked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        <span>${post.likes} Like${post.likes !== 1 ? 's' : ''}</span>
                    </button>
                </div>
            </div>
        </div>
    `;
};


/**
 * Renders the current posts array to the DOM.
 */
const renderPosts = (postArray = posts) => {
    const container = document.getElementById('posts-container');
    const emptyMessage = document.getElementById('empty-feed-message');
    
    if (!container) return; 

    container.innerHTML = ''; 

    if (postArray.length === 0) {
        if (emptyMessage) {
            emptyMessage.style.display = 'block'; 
            container.appendChild(emptyMessage);
        }
        return;
    }
    
    if (emptyMessage) emptyMessage.style.display = 'none';

    postArray.forEach(post => {
        const postHtml = createPostElement(post);
        container.insertAdjacentHTML('beforeend', postHtml);
    });
};


// -----------------------------------------------------------------
// Post Creation Handler
// -----------------------------------------------------------------
const handleCreatePost = () => {
    const contentInput = document.getElementById('post-content');
    const imageLinkInput = document.getElementById('image-link');
    const createPostBtn = document.getElementById('create-post-btn');

    if (!createPostBtn) return;

    createPostBtn.addEventListener('click', () => {
        const content = contentInput.value.trim();
        let imageUrl = imageLinkInput.value.trim();

        if (content === '' && imageUrl === '') {
            alert('Please enter some text or an image link to create a post.');
            return;
        }
        
        if (imageUrl && !imageUrl.startsWith('http')) {
            // This is good defensive programming, keeping it.
            imageUrl = 'https://via.placeholder.com/600x300.png?text=Invalid+Image';
        }

        const newPost = {
            id: Date.now(), 
            content: content,
            imageUrl: imageUrl, // Image URL is correctly stored here
            timestamp: getTimeStamp(),
            likes: 0,
            isLiked: false,
            date: new Date()
        };

        posts.unshift(newPost);
        savePosts(posts);

        contentInput.value = '';
        imageLinkInput.value = '';

        renderPosts();
        updateActiveSortButton('sort-latest');
    });
};


// -----------------------------------------------------------------
// Like/Delete Delegated Handler
// -----------------------------------------------------------------
const handlePostActions = () => {
    const postsContainer = document.getElementById('posts-container');

    if (!postsContainer) return;

    postsContainer.addEventListener('click', (event) => {
        const target = event.target.closest('button[data-action]');
        if (!target) return;

        const postItem = target.closest('.post-item');
        if (!postItem) return;

        const postId = parseInt(postItem.dataset.id);
        const action = target.dataset.action;

        const postIndex = posts.findIndex(p => p.id === postId);

        if (postIndex === -1) return;

        if (action === 'like') {
            const post = posts[postIndex];
            post.isLiked = !post.isLiked;
            post.likes += post.isLiked ? 1 : -1;

            savePosts(posts);
            renderPosts();

        } else if (action === 'delete') {
            if (confirm('Are you sure you want to delete this post?')) {
                posts.splice(postIndex, 1);
                savePosts(posts);
                renderPosts();
            }
        }
    });
};


// -----------------------------------------------------------------
// Sorting Handlers (FIXED THEME 4 COLORS)
// -----------------------------------------------------------------
const setupSorting = () => {
    const sortButtons = [
        // Ensure date objects are compared correctly
        { id: 'sort-latest', sortFn: (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() }, 
        { id: 'sort-liked', sortFn: (a, b) => b.likes - a.likes },
        { id: 'sort-oldest', sortFn: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() } 
    ];
    
    window.updateActiveSortButton = (activeId) => {
        sortButtons.forEach(buttonInfo => {
            const button = document.getElementById(buttonInfo.id);
            if (button) {
                if (buttonInfo.id === activeId) {
                    // MISTAKE 3 FIXED: Active button hover changed from blue-700 to orange-600
                    button.className = 'px-4 py-1.5 text-sm font-semibold rounded-full bg-orange-500 text-white hover:bg-orange-600 transition duration-150 shadow-md';
                } else {
                    // MISTAKE 4 FIXED: Inactive button changed to Theme 4 amber-100/orange-700
                    button.className = 'px-4 py-1.5 text-sm font-medium rounded-full bg-amber-100 text-orange-700 hover:bg-amber-200 transition duration-150';
                }
            }
        });
    };

    sortButtons.forEach(buttonInfo => {
        const button = document.getElementById(buttonInfo.id);
        if(button) {
            button.addEventListener('click', () => {
                posts.sort(buttonInfo.sortFn);
                updateActiveSortButton(buttonInfo.id);
                renderPosts();
            });
        }
    });
};


// =================================================================
//                       PAGE INITIALIZATION
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    const isLoggedIn = localStorage.getItem(LOGGED_IN_KEY);

    // --- AUTH CHECK & WELCOME MESSAGE ---
    if (isLoggedIn) {
        if (currentPage === 'index.html' || currentPage === 'login.html' || currentPage === '') {
            window.location.href = 'feed.html';
        } else if (currentPage === 'feed.html') {
            const user = JSON.parse(isLoggedIn);
            const welcomeMessage = document.getElementById('welcome-message');
            if (welcomeMessage) {
                welcomeMessage.textContent = `Welcome, ${user.name}`;
            }
        }
    } else {
        if (currentPage === 'feed.html') {
            window.location.href = 'login.html';
        }
    }

    // --- Logout Handler ---
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem(LOGGED_IN_KEY);
            localStorage.removeItem(POSTS_STORAGE_KEY);
            window.location.href = 'login.html';
        });
    }

    // --- Auth Form Handlers ---
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // --- FEED HANDLERS ---
    if (currentPage === 'feed.html') {
        handleCreatePost();
        handlePostActions();
        setupSorting();
        
        updateActiveSortButton('sort-latest');
        renderPosts();
    }
});