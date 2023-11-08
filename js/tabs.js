document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('#tabs button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = document.querySelector(tab.dataset.tabTarget);

            // Remove active classes from all tabs and contents
            tabs.forEach(t => {
                t.classList.remove('text-blue-600', 'border-blue-600');
                t.classList.add('hover:text-gray-600', 'hover:border-gray-300');
            });
            tabContents.forEach(tc => {
                tc.classList.add('hidden');
            });

            // Add active classes to clicked tab and its content
            tab.classList.add('text-blue-600', 'border-blue-600');
            tab.classList.remove('hover:text-gray-600', 'hover:border-gray-300');
            target.classList.remove('hidden');
        });
    });
});
