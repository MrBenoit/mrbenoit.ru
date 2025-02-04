document.addEventListener('DOMContentLoaded', () => {
	const themeToggle = document.getElementById('theme-toggle')
	const htmlElement = document.documentElement
	const languageSelect = document.getElementById('language-select')
	const content = document.getElementById('content')
	const navLinks = document.querySelectorAll('nav a')
	const nav = document.querySelector('nav')
	const header = document.querySelector('header') // Хедер
	let lastScrollY = window.scrollY // Последняя позиция скролла

	let indicator = document.createElement('div')
	indicator.classList.add('nav-indicator')
	nav.appendChild(indicator)

	document.addEventListener('DOMContentLoaded', () => {
		document
			.querySelector('meta[name="theme-color"]')
			.setAttribute('content', '#384254')
	})

	const translations = {
		ru: {
			about: 'Главная',
			portfolio: 'Портфолио',
			blog: 'Блог',
			contact: 'Контакты',
			welcome: 'Добро пожаловать на мой сайт!',
		},
		en: {
			about: 'Home',
			portfolio: 'Portfolio',
			blog: 'Blog',
			contact: 'Contact',
			welcome: 'Welcome to my website!',
		},
	}

	function applyTranslation(lang) {
		document.querySelectorAll('[data-lang]').forEach(element => {
			const key = element.getAttribute('data-lang')
			if (translations[lang] && translations[lang][key]) {
				element.textContent = translations[lang][key]
			}
		})
		localStorage.setItem('language', lang)
	}

	function updateIndicator(link) {
		const { left, width } = link.getBoundingClientRect()
		const navLeft = nav.getBoundingClientRect().left
		indicator.style.width = `${width}px`
		indicator.style.transform = `translateX(${left - navLeft}px)`
	}

	async function loadPage(page) {
		if (page === 'index') {
			localStorage.setItem('currentPage', page)
			applyTranslation(localStorage.getItem('language') || 'ru')
			updateActiveLink(page)
			return
		}

		try {
			const response = await fetch(`/pages/${page}.html`)
			if (!response.ok) throw new Error(`Ошибка загрузки: /pages/${page}.html`)

			const html = await response.text()
			content.innerHTML = html
			localStorage.setItem('currentPage', page)
			applyTranslation(localStorage.getItem('language') || 'ru')
			updateActiveLink(page)
		} catch (error) {
			console.error(error)
			content.innerHTML = `<h2>Ошибка 404</h2><p>Страница не найдена.</p>`
		}
	}

	function updateActiveLink(page) {
		navLinks.forEach(link => {
			const isActive = link.getAttribute('href').replace('.html', '') === page
			link.classList.toggle('active', isActive)
			if (isActive) updateIndicator(link)
		})
	}

	console.log('JavaScript загружен! Проверяем пути...')
	const savedTheme = localStorage.getItem('theme') || 'dark'
	htmlElement.setAttribute('data-theme', savedTheme)

	themeToggle.addEventListener('click', () => {
		const newTheme =
			htmlElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
		htmlElement.setAttribute('data-theme', newTheme)
		localStorage.setItem('theme', newTheme)
	})

	navLinks.forEach(link => {
		link.addEventListener('click', event => {
			event.preventDefault()
			const page = link.getAttribute('href').replace('.html', '')
			loadPage(page)
		})
	})

	languageSelect.addEventListener('change', event => {
		const selectedLanguage = event.target.value
		applyTranslation(selectedLanguage)
	})

	const savedLanguage = localStorage.getItem('language') || 'ru'
	languageSelect.value = savedLanguage
	applyTranslation(savedLanguage)

	const savedPage = localStorage.getItem('currentPage') || 'index'
	loadPage(savedPage)

	// ✅ Логика тени хедера при скролле (без скрытия)
	window.addEventListener('scroll', () => {
		if (window.scrollY > 50) {
			header.classList.add('scrolled') // Добавляем тень при прокрутке вниз
		} else {
			header.classList.remove('scrolled') // Убираем тень при возвращении наверх
		}
	})
})
