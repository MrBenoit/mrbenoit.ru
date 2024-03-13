document.querySelector('.menu-icon').addEventListener('click', function() {
	const menu = document.querySelector('.menu');
	if (menu.style.display === 'block') {
			menu.style.display = 'none';
	} else {
			menu.style.display = 'block';
	}
});

document.querySelector('.settings-icon').addEventListener('click', function() {
	const settings = document.querySelector('.settings');
	settings.style.display = settings.style.display === 'block' ? 'none' : 'block';
});
