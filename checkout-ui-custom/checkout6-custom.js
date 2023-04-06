class checkEmailAuthConflict {
  static dataRendered = false;
  constructor() {
    this.orderForm = "";
  }

  showModal() {
    const addressInfo = b2bCheckoutSettings.addresses;
    const formattedAddress = `
		${addressInfo[0].receiverName}
		${addressInfo[0].number ? addressInfo[0].number + " " : ""}${addressInfo[0].street}
		${addressInfo[0].complement ? addressInfo[0].complement + " " : ""}
		${addressInfo[0].neighborhood ? addressInfo[0].neighborhood + " - " : ""}${
		addressInfo[0].city
		}
		${addressInfo[0].state} ${addressInfo[0].postalCode}
		${addressInfo[0].country}
	`;

    const form = `
		<form>
		  <div>
			<label>
			  <input type="radio" name="parent" value="option1" checked> ${formattedAddress}
			</label>
			<div>
			  <label>
				Dropdown 1:
				<select name="dropdown1">
				  <option value="optionA">Option A</option>
				  <option value="optionB">Option B</option>
				  <option value="optionC">Option C</option>
				</select>
			  </label>
			  <input type="text" name="text1">
			</div>
			<label>
			  <input type="radio" name="parent" value="option2"> Option 2
			</label>
			<div>
			  <label>
				Dropdown 2:
				<select name="dropdown2">
				  <option value="optionX">Option X</option>
				  <option value="optionY">Option Y</option>
				  <option value="optionZ">Option Z</option>
				</select>
			  </label>
			  <input type="text" name="text2">
			</div>
		  </div>
		</form>
	  `;

    if (!checkEmailAuthConflict.dataRendered) {
      $(".v-custom-payment-item-wrap.active").append(form);
      checkEmailAuthConflict.dataRendered = true;
    }
  }

  checkPaymentStep() {
    return window.location.hash === "#/payment";
  }

  init() {
    const _this = this;

    try {
      $(document).ajaxComplete(function () {
        if (_this.checkPaymentStep()) {
          _this.showModal(b2bCheckoutSettings);
        }
      });
    } catch (e) {
      console.error(`Error on validating url: ${e}`);
    }
  }
}

$(window).on("orderFormUpdated.vtex", function (evt, orderForm) {
  window.validateAuthEmail = new checkEmailAuthConflict();
  if (typeof b2bCheckoutSettings !== "undefined") {
    validateAuthEmail.init();
  }
});
