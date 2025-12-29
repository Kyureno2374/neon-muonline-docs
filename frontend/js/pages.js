// pages.js — API functionality removed
// All backend connections have been removed
;(function () {
    async function loadAdminPagesList() {
        const container = document.getElementById('pagesContainer');
        if (!container) return;
        container.innerHTML = '<p class="error">Backend connection removed. API functionality disabled.</p>';
    }

    // expose for inline init
    window.loadAdminPagesList = loadAdminPagesList;
    window.loadAdminPagesList(); // try to load immediately if script inserted late
})();


