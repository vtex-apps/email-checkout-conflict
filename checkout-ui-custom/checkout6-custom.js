window.customPaymentMethod = {
	bill_to_district_new_po: "I already have a new Purchase Order in place to cover this purchase.",
	bill_to_dristrict_requisitioned: "I have a new Purchase Order to cover this purchase",
	bill_to_district_blanket: "I wish to use a Blank Purchase Order already on file at Cosmo Music"
}

class paymentCheckoutExt {
  static dataRendered = false;
  constructor() {
    this.orderForm = "";
  }

  showPaymentContent() {
    const districtInfo = b2bCheckoutSettings;
	const schoolDistrict = districtInfo.customFields.find(field => field.name === "School District").value;
	const schoolDistrictAddress = districtInfo.customFields.find(field => field.name === "School District Address").value;

    const form = `
	<form>
		<div>
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
	</form>
	`;

    if (!paymentCheckoutExt.dataRendered) {
      $(".v-custom-payment-item-wrap.active").append(form);
      paymentCheckoutExt.dataRendered = true;
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
        }
      });
    } catch (e) {
      console.error(`Error on validating url: ${e}`);
    }
  }
}

$(window).on("orderFormUpdated.vtex", function (evt, orderForm) {
  window.customCheckoutValidation = new paymentCheckoutExt();
  if (typeof b2bCheckoutSettings !== "undefined") {
    customCheckoutValidation.init();
  }
});
