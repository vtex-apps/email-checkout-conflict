window.checkEmailAuthConflictMessages = {

	en: {
		title: "Email conflict",
		button: "Log In",
		message: "It looks like the email you entered is different from the one that was previously registered. Please log in again by clicking the button below."
	},
	es: {
		title: "Email no registrado ",
		button: "Iniciar sesión",
		message: "Parece que el email que has ingresado es diferente del que se registró anteriormente. Por favor, inicia sesión de nuevo haciendo clic en el botón a continuación."
	},
    "pt-BR": {
        title:"Conflito de e-mail",
        button:"Login",
        message:"Identificamos que você provavelmente usou um endereço de e-mail diferente do que você inseriu anteriormente. Por favor, faça o login novamente clicando no botão abaixo.",
    },
	ro: {
		title:"Conflict adresa email",
		button:"Loghează-te",
		message:"Am identificat că probabil ați folosit un alt e-mail de conectare decât cel introdus anterior. Vă rugăm să vă conectați din nou făcând clic pe butonul de mai jos."
	},
	bg: {
		title: "Конфликт на имейл адреси",
		button: "Влизане",
		message: "Изглежда, че въведеният от вас имейл е различен от този, който е бил регистриран преди това. Моля, влезте отново, като щракнете върху бутона по-долу."
	},
	de: {
		title: "E-Mail-Konflikt",
		button: "Einloggen",
		message: "Es sieht so aus, als ob die eingegebene E-Mail sich von der unterscheidet, die zuvor registriert wurde. Bitte melden Sie sich erneut an, indem Sie auf den Button unten klicken."
	},
	fr: {
		title: "Conflit d'e-mail",
		button: "Se connecter",
		message: "Il semble que l'e-mail que vous avez saisi soit différent de celui qui a été enregistré précédemment. Veuillez vous reconnecter en cliquant sur le bouton ci-dessous."
	},
	it: {
		title: "Conflitto di email",
		button: "Accedi",
		message: "Sembra che l'email inserita sia diversa da quella registrata in precedenza. Accedi di nuovo cliccando sul pulsante in basso."
	},
	ja: {
		title: "メールの不一致",
		button: "ログイン",
		message: "入力したメールアドレスが以前に登録したものと異なるようです。下のボタンをクリックし、もう一度ログインしてください。"
	},
	ko: {
		title: "이메일 충돌",
		button: "로그인",
		message: "입력한 이메일이 이전에 등록한 이메일과 다른 것 같습니다. 아래 버튼을 클릭하여 다시 로그인하세요."
	},
	nl: {
		title: "E-mailconflict",
		button: "Inloggen",
		message: "Het lijkt erop dat het e-mailadres dat u hebt ingevoerd anders is dan het e-mailadres dat u eerder hebt geregistreerd. Log opnieuw in door op onderstaande knop te klikken."
	},
	th: {
		title: "อีเมลไม่ตรงกัน",
		button: "ล็อกอิน",
		message: "ดูเหมือนว่าอีเมลที่คุณให้ต่างจากที่ลงทะเบียนไว้ โปรดล็อกอินอีกครั้งโดยคลิกปุ่มที่ด้านล่าง"
	}
}


class checkEmailAuthConflict {
	constructor({} = {}) {
		this.orderForm = "";
    this.lang = "";
	}

    getRootPath = () => {
        const { rootPath } =
          window.__RUNTIME__ || (window.vtex && window.vtex.renderRuntime) || {};
    
        return rootPath || "";
    };

	removeModal() {
		$(".checkEmailAuthConflict__modal").fadeOut("normal", function() {
			$(".checkEmailAuthConflict__modal").remove();
		});
	} 

	showModal() {

		const _this = this;

		$(".checkEmailAuthConflict__modal").remove();

		if(!_this.lang) return false;
		if(!checkEmailAuthConflictMessages[this.lang]) this.lang = "en";
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

		$.ajax(`${this.getRootPath()}/checkout/changeToAnonymousUser/${_this.orderForm.orderFormId}`)
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
				fetch(`${this.getRootPath()}/api/vtexid/pub/authenticated/user`, {credentials: 'include'})
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

	validateOperations(orderForm) {
		if (orderForm.userType === 'callCenterOperator' || ~window.location.host.indexOf(`myvtex`)) {
			return false
		}
		return true
	}

	init() {
		const _this = this;

		try {

			$(window).one('orderFormUpdated.vtex', function(_, orderForm) {
				if (_this.validateOperations(orderForm)) {
	
					_this.orderForm = orderForm;
					_this.lang = vtex ? vtex.i18n.locale : "en";
					try {
						_this.validate();
						_this.bind();
					} catch(e) {
						console.error(e)
					} 
				}
	
			});
	
			$(window).on('authenticatedUser.vtexid closed.vtexid', function() {
				_this.orderForm = vtexjs.checkout.orderForm;
				if (_this.validateOperations(_this.orderForm)) {
					try {
						_this.validate();
					} catch(e) {
						console.error(e)
					} 
				} 
			});

		} catch(e) {
			console.error(`Error on checkEmailAuthConflict: ${e}`)
		}
		
	}
}


window.validateAuthEmail = new checkEmailAuthConflict()
validateAuthEmail.init(); 