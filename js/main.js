const formSearch = document.querySelector(".form-search"),
	inputCitiesFrom = formSearch.querySelector(".input__cities-from"),
	dropdownCitiesFrom = formSearch.querySelector(".dropdown__cities-from"),
	inputCitiesTo = formSearch.querySelector(".input__cities-to"),
	dropdownCitiesTo = formSearch.querySelector(".dropdown__cities-to"),
	inputDateDepart = formSearch.querySelector(".input__date-depart"),
	cheapestTicket = document.getElementById("cheapest-ticket"),
	otherCheapTickets = document.getElementById("other-cheap-tickets"),
	preloader = document.querySelector(".preloader"),
	errorMessage = document.querySelector(".error"),
	dropdown = document.querySelectorAll(".dropdown__city");

const citiesApi = "http://api.travelpayouts.com/data/ru/cities.json",
	proxy = "https://cors-anywhere.herokuapp.com/",
	API_KEY = "c27ad48136344cb745126010582436d6",
	calendar = "http://min-prices.aviasales.ru/calendar_preload",
	MAX_COUNT = 10;

let index = -1;
let index1 = -1;
let city = [];

let today = new Date;
today = today.toISOString().slice(0,10);
inputDateDepart.setAttribute('min', today);
const yearAfter =  `${parseInt(today.split('-')[0])+1}-${today.split('-')[1]}-${today.split('-')[2]}`
inputDateDepart.setAttribute('max', yearAfter);

const getData = (url, callback) => {
	// preloader.style.display = "block";
	errorMessage.style.display = "none";

	fetch(url)
		.then(
			(response) => {
				preloader.style.display = "none";
				return response.json();
			},
			(failresponse) => {
				if (failresponse === 400) {
					errorMessage.textContent =
						"Произошла ошибка! Билетов на данный рейс нету!";
					errorMessage.style.display = "block";
					cheapestTicket.style.display = "none";
					otherCheapTickets.style.display = "none";
				}
			}
		)
		.then((data) => {
			console.log(data);

			city = data.filter((item) => item.name);
			city.sort((a, b) => {
				if (a.name > b.name) {
					return 1;
				}
				if (a.name < b.name) {
					return -1;
				}
				return 0;
			});

			console.log(city);
		});
};

const getFlyData = (url, callback) => {
	// preloader.style.display = "block";
	errorMessage.style.display = "none";

	fetch(url)
		.then(
			(response) => {
				console.log('res', response)
				preloader.style.display = "none";
				return response.json();
			},
			(failresponse) => {
				if (failresponse === 400) {
					errorMessage.textContent =
						"Произошла ошибка! Билетов на данный рейс нету!";
					errorMessage.style.display = "block";
					cheapestTicket.style.display = "none";
					otherCheapTickets.style.display = "none";
				}
			}
		)
		.then((data) => {
			callback(data);
			
		});
};


getData(proxy + citiesApi);

const showCity = (input, list) => {
	list.textContent = "";

	if (input.value !== "") {
		const filterCity = city.filter((item) => {
			const fixItem = item.name.toLowerCase();
			return fixItem.startsWith(input.value.toLowerCase());
		});

		filterCity.forEach((item) => {
			const li = document.createElement("li");
			li.classList.add("dropdown__city");
			li.textContent = item.name;
			list.append(li);
		});
	}
};

const selectCity = (event, input, list) => {
	const target = event.target;
	if (target.tagName.toLowerCase() === "li") {
		input.value = target.textContent;
		list.textContent = "";
	}
};

const getNameCity = (code) => {
	const objCity = city.find((item) => item.code === code);
	return objCity.name;
};

const getDate = (date) => {
	return new Date(date).toLocaleString("ru-RU", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

const getChanges = (n) => {
	if (n) {
		return n === 1 ? "С одной пересадкой" : "С двумя пересадками";
	} else {
		return "Без пересадок";
	}
};

const getLinkAviasales = (data) => {
	let link = "http://wwww.aviasales.ua/search/";

	link += data.origin;

	const date = new Date(data.depart_date);

	const day = date.getDate();

	link += day < 10 ? "0" + day : day;

	const month = date.getMonth() + 1;

	link += month < 10 ? "0" + month : month;

	link += data.destination;

	link += "1";

	return link;
};

const createCard = (data) => {
	const ticket = document.createElement("article");
	ticket.classList.add("ticket");

	let deep = "";

	if (data) {
		deep = `
		<h3 class="agent">${data.gate}</h3>
			<div class="ticket__wrapper">
				<div class="left-side">
					<a href="${getLinkAviasales(
						data
					)}" target="_blank" class="button button__buy">Купить	за ${
			data.value
		}грн.</a>
				</div>
				<div class="right-side">
					<div class="block-left">
						<div class="city__from">Вылет из города
							<span class="city__name">${getNameCity(data.origin)}</span>
						</div>
						<div class="date">${getDate(data.depart_date)}</div>
					</div>

					<div class="block-right">
						<div class="changes">${getChanges(data.number_of_changes)}</div>
						<div class="city__to">Город назначения:
							<span class="city__name">${getNameCity(data.destination)}</span>
						</div>
					</div>
				</div>
			</div>
		`;
	} else {
		deep = "<h3>К сожалению на текущую дату билетов не нашлось!</h3>";
	}

	ticket.insertAdjacentHTML("afterbegin", deep);

	return ticket;
};

const renderCheapDay = (cheapTicket) => {
	cheapestTicket.style.display = "block";
	cheapestTicket.innerHTML = "<h2>Самый дешевый билет на выбранную дату</h2>";

	const ticket = createCard(cheapTicket[0]);
	cheapestTicket.append(ticket);
};

const renderCheapYear = (cheapTickets) => {
	otherCheapTickets.style.display = "block";
	otherCheapTickets.innerHTML = "<h2>Самые дешевые билеты на другие даты</h2>";

	cheapTickets.sort((a, b) => a.value - b.value);

	for (let i = 0; i < cheapTickets.length && i < MAX_COUNT; i++) {
		const ticket = createCard(cheapTickets[i]);
		otherCheapTickets.append(ticket);
	}

	console.log(cheapTickets);
};

const renderCheap = (data, date) => {
	const cheapTicketYear =  data.best_prices;

	const cheapTicketDay = cheapTicketYear.filter((item) => {
		return item.depart_date === date;
	});

	renderCheapDay(cheapTicketDay);
	renderCheapYear(cheapTicketYear);
};

inputCitiesFrom.addEventListener("input", () => {
	showCity(inputCitiesFrom, dropdownCitiesFrom);
	dropdownCitiesFrom.style.display = "block";
	inputCitiesFrom.style.border = 'none'
	inputCitiesTo.style.border = 'none'
});

inputCitiesTo.addEventListener("input", () => {
	showCity(inputCitiesTo, dropdownCitiesTo);
	dropdownCitiesTo.style.display = "block";
	inputCitiesFrom.style.border = 'none'
	inputCitiesTo.style.border = 'none'
});

dropdownCitiesFrom.addEventListener("click", (event) => {
	selectCity(event, inputCitiesFrom, dropdownCitiesFrom);
});

dropdownCitiesTo.addEventListener("click", (event) => {
	selectCity(event, inputCitiesTo, dropdownCitiesTo);
});

inputDateDepart.addEventListener("click", () => {});

formSearch.addEventListener("submit", (event) => {
	event.preventDefault();

	const cityFrom = city.find((item) => {
		return inputCitiesFrom.value === item.name;
	});

	const cityTo = city.find((item) => {
		return inputCitiesTo.value === item.name;
	});

	const formData = {
		from: cityFrom,
		to: cityTo,
		when: inputDateDepart.value,
	};

	if (formData.from && formData.to) {
		const requestData =
			`?depart_date=${formData.when}&origin=${formData.from.code}` +
			`&destination=${formData.to.code}&one_way=true`;

		getFlyData(calendar + requestData, (data) => {
			  console.log('123', data)
			renderCheap(data, formData.when);
		});
	} else {
		if (!formData.from) {
			inputCitiesFrom.style.border = '1px solid red'
		} else {
			inputCitiesTo.style.border = '1px solid red'
		}
		alert("Введите корректное название города!");
	}
});

document.addEventListener("click", (event) => {
	const el = event.target;

	if (el !== inputCitiesFrom && el !== inputCitiesTo) {
		inputCitiesFrom.blur();
		inputCitiesTo.blur();
		if (
			dropdownCitiesFrom.style.display === "none" &&
			dropdownCitiesTo.style.display === "none"
		) {
			return;
		} else {
			dropdownCitiesFrom.style.display = "none";
			dropdownCitiesTo.style.display = "none";
		}
	}
});

inputCitiesFrom.addEventListener("keyup", (event) => {
	for (let i = 0; i < dropdownCitiesFrom.children.length; i++) {
		dropdownCitiesFrom.children[i].classList.remove("focus");
	}

	if (inputCitiesFrom.value === "") {
		return;
	}

	switch (event.keyCode) {
		/* case 8: 
			if (index !== 0) {
				index = 0; // Исправить Backspace
			}

			if (dropdownCitiesFrom.length === undefined) {
				return;
			} else {
				dropdownCitiesFrom.children[index].classList.add("focus");
				dropdownCitiesFrom.style.display = "block";
			}

			break; */
		case 27: // Esc
			dropdownCitiesFrom.style.display = "none";
			break;
		case 38:
			--index;

			let target = dropdownCitiesFrom.children[index];

			if (index >= 0) {
				target.classList.add("focus");
				inputCitiesFrom.value = target.textContent;
			}

			if (index >= 10) {
				dropdownCitiesFrom.scrollTop = 28 * (index - 9);
			}

			if (index === -1) {
				index = dropdownCitiesFrom.children.length - 1;
				dropdownCitiesFrom.scrollTop = 28 * (index - 9);
				dropdownCitiesFrom.lastChild.classList.add("focus");
				inputCitiesFrom.value = dropdownCitiesFrom.children[index].textContent;
			}
			break;
		case 40:
			index++;

			let target2 = dropdownCitiesFrom.children[index];

			if (index < dropdownCitiesFrom.children.length) {
				target2.classList.add("focus");
				inputCitiesFrom.value = target2.textContent;
			}

			if (index >= 9) {
				dropdownCitiesFrom.scrollTop = 28 * (index - 9);
			}

			if (index === dropdownCitiesFrom.children.length) {
				index = 0;
				dropdownCitiesFrom.scrollTop = 0;
				dropdownCitiesFrom.children[0].classList.add("focus");
				inputCitiesFrom.value = dropdownCitiesFrom.children[0].textContent;
			}
			break;
	}
});

inputCitiesTo.addEventListener("keyup", (event) => {
	for (let i = 0; i < dropdownCitiesTo.children.length; i++) {
		dropdownCitiesTo.children[i].classList.remove("focus");
	}

	if (inputCitiesTo.value === "") {
		return;
	}

	switch (event.keyCode) {
		/* case 8: //backspace
			if (index1 !== 0) {
				index1 = 0;
			}
			dropdownCitiesTo.children[index1].classList.add("focus");
			dropdownCitiesTo.style.display = "block";
			break; */
		case 27:
			dropdownCitiesTo.style.display = "none";
			break;
		case 38:
			--index1;

			let target = dropdownCitiesTo.children[index1];

			if (index1 >= 0) {
				target.classList.add("focus");
				inputCitiesTo.value = target.textContent;
			}

			if (index1 >= 10) {
				// реализуем прокрутку (28px - высота одной лишки)
				dropdownCitiesTo.scrollTop = 28 * (index1 - 9);
			}

			if (index1 === -1) {
				index1 = dropdownCitiesTo.children.length - 1;
				dropdownCitiesTo.scrollTop = 28 * (index1 - 9);
				dropdownCitiesTo.lastChild.classList.add("focus");
				inputCitiesTo.value = dropdownCitiesTo.children[index1].textContent;
			}
			break;
		case 40:
			index1++;

			let target2 = dropdownCitiesTo.children[index1];

			if (index1 < dropdownCitiesTo.children.length) {
				target2.classList.add("focus");
				inputCitiesTo.value = target2.textContent;
			}

			if (index1 >= 9) {
				dropdownCitiesTo.scrollTop = 28 * (index1 - 9);
			}

			if (index1 === dropdownCitiesTo.children.length) {
				index1 = 0;
				dropdownCitiesTo.scrollTop = 0;
				dropdownCitiesTo.children[0].classList.add("focus");
				inputCitiesTo.value = dropdownCitiesTo.children[0].textContent;
			}
			break;
	}
});