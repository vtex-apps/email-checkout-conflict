window.checkEmailAuthConflictMessages = {

	en: {
		title:"Emails conflict",
		button:"Login",
		message:"We have identified that you probably used a different login email than the one you entered previously. Please log in again by clicking the button below."
	},
	es: {
		title:"Conflicto de correos electrónicos",
		button:"Ingressar",
		message:"Hemos identificado que probablemente utilizó una dirección de correo electrónico de inicio de sesión diferente a la que ingresó anteriormente. Vuelva a iniciar sesión haciendo clic en el botón de abajo."
	}
}


class checkEmailAuthConflict {
	constructor({} = {}) {
		this.orderForm = "";
    this.lang = "";
	}

	removeModal() {
		$(".checkEmailAuthConflict__modal").fadeOut("normal", function() {
			$(".checkEmailAuthConflict__modal").remove();
		});
	} 

	showModal() {

		const _this = this;

		$(".checkEmailAuthConflict__modal").remove();

		if(!_this.lang) return false
		let modal = `
			<div class="checkEmailAuthConflict__modal">
				<div class="checkEmailAuthConflict__modal--bg"></div>
				<div class="checkEmailAuthConflict__modal--wrap">
					<h4 class="checkEmailAuthConflict__modal--title">${checkEmailAuthConflictMessages[this.lang].title}</h4>
					<p class="checkEmailAuthConflict__modal--text">${checkEmailAuthConflictMessages[this.lang].message}</p>
					<button class="checkEmailAuthConflict__modal--button js-checkEmailAuthConflict__modal--button">${checkEmailAuthConflictMessages[this.lang].button}</button>
				</div>
			</div>
		`;

		$("body").append(modal);

	}

	bind() {
		const _this = this;

		$("body").on("click", ".js-checkEmailAuthConflict__modal--button", function(e) {
			e.preventDefault();
			$(this).addClass("js-loading");
			_this.changeUser();
		})

	}

	changeUser() {
		const _this = this;

		$.ajax(`/checkout/changeToAnonymousUser/${_this.orderForm.orderFormId}`)
		.done(function() {
			_this.removeModal();
			vtexid.start();
		});
	}

	validate() {
		const _this = this;
		try {
			if( 
				_this.orderForm && 
				_this.orderForm.clientProfileData && 
				_this.orderForm.clientProfileData.email 
			) {
				fetch('/api/vtexid/pub/authenticated/user', {credentials: 'include'})
				.then(response => response.json())
				.then(function(response) {
					if(!response) return false;
					let user = response.user;
					if(_this.orderForm.clientProfileData.email != user) {
						_this.showModal();
					}
				})
			}
		} catch(e) {
			console.error(e)
		} 
	}

	init() {
		const _this = this;
		$(window).one('orderFormUpdated.vtex', function(evt, orderForm) {
			_this.orderForm = orderForm;
			_this.lang = vtex ? vtex.i18n.locale : "en";
			_this.validate();
			_this.bind();
		})
	}
}


window.validateAuthEmail = new checkEmailAuthConflict()
validateAuthEmail.init(); 