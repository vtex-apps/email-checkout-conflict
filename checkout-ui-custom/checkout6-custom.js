window.customPaymentMethod = {
  bill_to_district_new_po:
    "I already have a new Purchase Order in place to cover this purchase.",
  bill_to_dristrict_requisitioned:
    "I have a new Purchase Order to cover this purchase",
  bill_to_district_blanket:
    "I wish to use a Blank Purchase Order already on file at Cosmo Music",
};

class paymentCheckoutExt {
  dataRendered = false;
  settingsFetched = false;

  constructor() {
    this.orderForm = "";
  }

  // Used to remove cache from requests
  isWorkspace = function () {
    return window.__RUNTIME__.workspace !== "master";
  };

  getApp = () => {
    if (this.settingsFetched) {
      return;
    }

    const rootPath =
      window.vtex.renderRuntime.rootPath !== undefined
        ? window.vtex.renderRuntime.rootPath
        : "";

    const ts = new Date().getTime();

    $.ajax({
      url: `${rootPath}/_v/private/cosmo-b2b-checkout-extension/${
        this.isWorkspace() ? `?v=${ts}` : ""
      }`,
    }).then(function (response) {
        return () => {
			console.log(response)
		};
    });

    this.settingsFetched = true;
  };

  showPaymentContent(checkoutContent) {
	if(this.dataRendered) {
		return;
	}

    const districtInfo = checkoutContent;
    const schoolDistrict = districtInfo.customFields.find(
      (field) => field.name === "School District"
    ).value;
    const schoolDistrictAddress = districtInfo.customFields.find(
      (field) => field.name === "School District Address"
    ).value;

    const form = `
		<div id="custom-payment-info-container">
			<label>
				<input type="radio" name="bill_to_dristrict" value="bill_to_district" checked>
				Purchase Order from ${schoolDistrict}</br>${schoolDistrictAddress}
			</label>
			<div class="bill-to-district-group">
				<input type="radio" name="bill_to_district_new_po" value="bill_to_district_new_po">
				${customPaymentMethod.bill_to_district_new_po}
				</input>
				<br>
				<input type="radio" name="bill_to_district_requisitioned" value="bill_to_district_requisitioned">
				${customPaymentMethod.bill_to_dristrict_requisitioned}
				</input>
				<br>
				<input type="radio" name="bill_to_district_blanket" value="bill_to_district_blanket">
				${customPaymentMethod.bill_to_district_blanket}
				</input> 
				<br>
				<input type="text" placeholder="Enter PO Number or Comments" name="bill_to_district_comments">
				</input>
			</div>
			<label>
				<input type="radio" name="invoice_school" value="invoice_school">
				Invoice the School Directly
			</label>
			<div class="invoice-school" >
				<p>Upon shipment, an invoice will be mailed/emailed to your school admin. Payment is due within 30 days. (i.e. school cheque, parent council cheque, etc.)</p>
				<p>Please indicate the member of your school admin team that has authorized the order and that will be handling payment:</p>
				<input type="text" placeholder="Name" name="invoice_school_admin">
			</div>
		</div>
	`;

    if (!paymentCheckoutExt.dataRendered) {
      $(".v-custom-payment-item-wrap.active").append(form);
      this.dataRendered = true;
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
			_this.showPaymentContent(b2bCheckoutSettings);
			_this.getApp();
        }
      });
    } catch (e) {
      console.error(`Error on validating url: ${e}`);
    }
  }
}

$(window).on("orderFormUpdated.vtex", function (evt, orderForm) {
  if (typeof b2bCheckoutSettings !== "undefined") {
    window.customCheckoutValidation = new paymentCheckoutExt();
    customCheckoutValidation.init();
  }
});
