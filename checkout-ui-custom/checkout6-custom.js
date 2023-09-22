window.checkEmailAuthConflictMessages = {
  en: {
    title: "Emails conflict",
    button: "Login",
    message:
      "We have identified that you probably used a different login email than the one you entered previously. Please log in again by clicking the button below.",
  },
  es: {
    title: "Conflicto de correos electrónicos",
    button: "Ingressar",
    message:
      "Hemos identificado que probablemente utilizó una dirección de correo electrónico de inicio de sesión diferente a la que ingresó anteriormente. Vuelva a iniciar sesión haciendo clic en el botón de abajo.",
  },
  "pt-BR": {
    title: "Conflito de e-mail",
    button: "Login",
    message:
      "Identificamos que você provavelmente usou um endereço de e-mail diferente do que você inseriu anteriormente. Por favor, faça o login novamente clicando no botão abaixo.",
  },
  ro: {
    title: "Conflict adresa email",
    button: "Loghează-te",
    message:
      "Am identificat că probabil ați folosit un alt e-mail de conectare decât cel introdus anterior. Vă rugăm să vă conectați din nou făcând clic pe butonul de mai jos.",
  },
};

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
    $(".checkEmailAuthConflict__modal").fadeOut("normal", function () {
      $(".checkEmailAuthConflict__modal").remove();
    });
  }

  showModal() {
    const _this = this;

    $(".checkEmailAuthConflict__modal").remove();

    if (!_this.lang) return false;
    if (!checkEmailAuthConflictMessages[this.lang]) this.lang = "en";
    let modal = `
			<div class="checkEmailAuthConflict__modal">
				<div class="checkEmailAuthConflict__modal--bg"></div>
				<div class="checkEmailAuthConflict__modal--wrap">
					<h4 class="checkEmailAuthConflict__modal--title">${
            checkEmailAuthConflictMessages[this.lang].title
          }</h4>
					<p class="checkEmailAuthConflict__modal--text">${
            checkEmailAuthConflictMessages[this.lang].message
          }</p>
					<button class="checkEmailAuthConflict__modal--button js-checkEmailAuthConflict__modal--button">${
            checkEmailAuthConflictMessages[this.lang].button
          }</button>
				</div>
			</div>
		`;

    $("body").append(modal);
  }

  bind() {
    const _this = this;

    $("body").on(
      "click",
      ".js-checkEmailAuthConflict__modal--button",
      function (e) {
        e.preventDefault();
        $(this).addClass("js-loading");
        _this.changeUser();
      }
    );
  }

  changeUser() {
    const _this = this;

    $.ajax(
      `${_this.getRootPath()}/checkout/changeToAnonymousUser/${
        _this.orderForm.orderFormId
      }`
    ).done(function () {
      _this.removeModal();
      vtexid.start();
    });
  }

  validate() {
    const _this = this;

    try {
      if (
        _this.orderForm &&
        _this.orderForm.clientProfileData &&
        _this.orderForm.clientProfileData.email
      ) {
        fetch(`${_this.getRootPath()}/api/vtexid/pub/authenticated/user`, {
          credentials: "include",
        })
          .then((response) => response.json())
          .then(function (response) {
            if (!response) return false;
            let user = response.user;

            if (_this.orderForm.clientProfileData.email != user) {
              _this.showModal();
            }
          });
      }
    } catch (e) {
      console.error(e);
    }
  }

  validateOperations(orderForm) {
    if (
      orderForm.userType === "callCenterOperator" ||
      ~window.location.host.indexOf(`myvtex`)
    ) {
      return false;
    }
    return true;
  }

  init() {
    const _this = this;

    try {
      $(window).one("orderFormUpdated.vtex", function (_, orderForm) {
        if (_this.validateOperations(orderForm)) {
          _this.orderForm = orderForm;
          _this.lang = vtex ? vtex.i18n.locale : "en";
          try {
            _this.validate();
            _this.bind();
          } catch (e) {
            console.error(e);
          }
        }
      });

      $(window).on("authenticatedUser.vtexid closed.vtexid", function () {
        _this.orderForm = vtexjs.checkout.orderForm;
        if (_this.validateOperations(_this.orderForm)) {
          try {
            _this.validate();
          } catch (e) {
            console.error(e);
          }
        }
      });
    } catch (e) {
      console.error(`Error on checkEmailAuthConflict: ${e}`);
    }
  }
}

window.validateAuthEmail = new checkEmailAuthConflict();
validateAuthEmail.init();
