document.addEventListener('DOMContentLoaded', async () => {
	const themeToggle = document.getElementById('theme-toggle')
	const htmlElement = document.documentElement
	const languageSelect = document.getElementById('language-select')
	const content = document.getElementById('content')
	const nav = document.querySelector('nav')
	const header = document.querySelector('header')
	const allLinks = document.querySelectorAll('a[href]')
	const indicator = document.createElement('div')

	indicator.classList.add('nav-indicator')
	nav.appendChild(indicator)

	document
		.querySelector('meta[name="theme-color"]')
		.setAttribute('content', '#384254')

	let translations = {} // Хранилище переводов

	// 🔹 Загружаем JSON с переводами
	async function loadTranslations(lang) {
		try {
			const response = await fetch(`../locale/${lang}.json`)
			if (!response.ok) throw new Error(`Ошибка загрузки: /locale/${lang}.json`)
			translations = await response.json()
			applyTranslation()
		} catch (error) {
			console.error('Ошибка загрузки переводов:', error)
		}
	}

	// 🔹 Применение перевода
	function applyTranslation() {
		document.querySelectorAll('[data-lang]').forEach(el => {
			const key = el.getAttribute('data-lang')
			if (translations[key]) {
				el.textContent = translations[key]
			}
		})
	}

	// 🔹 Обновление индикатора активной ссылки
	const updateIndicator = link => {
		const { left, width } = link.getBoundingClientRect()
		const navLeft = nav.getBoundingClientRect().left
		indicator.style.width = `${width}px`
		indicator.style.transform = `translateX(${left - navLeft}px)`
	}

	// 🔹 Динамическая загрузка страниц
	const loadPage = async page => {
		const pagePath = `/pages/${page}.html?v=${Date.now()}`
		console.log(`🔄 Загружаем страницу: ${pagePath}`)

		try {
			const response = await fetch(pagePath, {
				method: 'GET',
				mode: 'no-cors', // Убираем CORS-ограничения
				cache: 'no-store', // Избегаем кеширования
			})

			if (!response.ok) {
				throw new Error(
					`❌ Ошибка загрузки: ${pagePath} (Статус: ${response.status})`
				)
			}

			const contentType = response.headers.get('Content-Type')
			if (!contentType || !contentType.includes('text/html')) {
				throw new Error(`❌ Неверный Content-Type: ${contentType}`)
			}

			content.innerHTML = await response.text()
			localStorage.setItem('currentPage', page)
			applyTranslation()
			updateActiveLink(page)
		} catch (error) {
			console.error(`🚨 Ошибка при загрузке страницы: ${error}`)
			content.innerHTML = `<h2>Ошибка 404</h2><p>Страница не найдена.</p>`
		}
	}

	// 🔹 Обновление активной ссылки в навигации
	const updateActiveLink = page => {
		document.querySelectorAll('nav a').forEach(link => {
			const isActive = link.getAttribute('href') === page
			link.classList.toggle('active', isActive)
			if (isActive) updateIndicator(link)
		})
	}

	// 🔹 Переключение темы
	const updateThemeIcons = theme => {
		document
			.getElementById('dark-icon')
			.classList.toggle('hidden', theme !== 'dark')
		document
			.getElementById('light-icon')
			.classList.toggle('hidden', theme === 'dark')
	}

	// Добавляем анимацию смены темы
	document.documentElement.style.transition =
		'background-color 0.1s ease-in-out, color 0.1s ease-in-out'

	const savedTheme = localStorage.getItem('theme') || 'dark'
	document.documentElement.setAttribute('data-theme', savedTheme)
	updateThemeIcons(savedTheme)

	themeToggle.addEventListener('click', () => {
		const newTheme =
			document.documentElement.getAttribute('data-theme') === 'dark'
				? 'light'
				: 'dark'

		// Добавляем временную задержку перед сменой атрибута, чтобы транзишн сработал
		document.documentElement.style.transition =
			'background-color 0.1s ease-in-out, color 0.1s ease-in-out'

		document.documentElement.setAttribute('data-theme', newTheme)
		localStorage.setItem('theme', newTheme)
		updateThemeIcons(newTheme)
	})

	// 🔹 Обработчик кликов на ссылки
	allLinks.forEach(link => {
		link.addEventListener('click', event => {
			event.preventDefault()
			const page = link.getAttribute('href')
			loadPage(page)
		})
	})

	// 🔹 Обработчик смены языка
	languageSelect.addEventListener('change', async event => {
		const lang = event.target.value
		localStorage.setItem('language', lang)
		await loadTranslations(lang)
	})

	// 🔹 Загружаем последнюю страницу и переводы
	const savedLanguage = localStorage.getItem('language') || 'ru'
	languageSelect.value = savedLanguage
	await loadTranslations(savedLanguage)

	const savedPage = localStorage.getItem('currentPage') || 'home'
	loadPage(savedPage)

	// 🔹 Добавление эффекта скролла к хедеру
	window.addEventListener('scroll', () => {
		header.classList.toggle('scrolled', window.scrollY > 50)
	})
})
