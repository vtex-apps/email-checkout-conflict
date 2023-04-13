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

  detectChanges() {
    const container = document.getElementById("custom-payment-info-container");
    const billToDistrictRadio = container.querySelector(
      'input[name="bill_to_dristrict"]'
    );
    const invoiceSchoolRadio = container.querySelector(
      'input[name="invoice_school"]'
    );
    const invoiceSchoolInput = container.querySelector(
      'input[name="invoice_school_admin"]'
    );
    const billToDistrictNewPORadio = container.querySelector(
      'input[name="bill_to_district_new_po"]'
    );
    const billToDistrictRequisitionedRadio = container.querySelector(
      'input[name="bill_to_district_requisitioned"]'
    );
    const billToDistrictBlanketRadio = container.querySelector(
      'input[name="bill_to_district_blanket"]'
    );
    const poCommentsInput = container.querySelector(
      'input[name="bill_to_district_comments"]'
    );

    const updateOrderFormCustomData = (path, value) => {
      const orderFormID = window.vtexjs.checkout.orderFormId;

      $.ajax({
        url: `${window.location.origin}/api/checkout/pub/orderForm/${orderFormID}/customData/cosmo-b2b-payment-extension/${path}`,
        type: "PUT",
        data: { value },
      });
    };

    billToDistrictRadio.addEventListener("change", () => {
      if (billToDistrictRadio.checked) {
        invoiceSchoolRadio.checked = false;
        invoiceSchoolInput.value = "";
        invoiceSchoolInput.disabled = true;
        poCommentsInput.disabled = false;

        updateOrderFormCustomData("bill_to_type", billToDistrictRadio.value);
      }
    });

    invoiceSchoolInput.addEventListener("change", (e) => {
      updateOrderFormCustomData("bill_to_text", e.target.value);
    });

    poCommentsInput.addEventListener("change", (e) => {
      updateOrderFormCustomData("bill_to_text", e.target.value);
    });

    invoiceSchoolRadio.addEventListener("change", () => {
      if (invoiceSchoolRadio.checked) {
        billToDistrictRadio.checked = false;
        billToDistrictNewPORadio.checked = false;
        billToDistrictRequisitionedRadio.checked = false;
        billToDistrictBlanketRadio.checked = false;
        poCommentsInput.disabled = true;
		invoiceSchoolInput.disabled = false;
        poCommentsInput.value = "";

        updateOrderFormCustomData("bill_to_type", invoiceSchoolRadio.value);
        updateOrderFormCustomData("bill_to_option", "null");
      }
    });

    billToDistrictNewPORadio.addEventListener("change", (e) => {
      if (billToDistrictNewPORadio.checked) {
        poCommentsInput.disabled = false;
        billToDistrictRequisitionedRadio.checked = false;
        billToDistrictBlanketRadio.checked = false;

        updateOrderFormCustomData(
          "bill_to_option",
          billToDistrictNewPORadio.value
        );
      }
    });

    billToDistrictRequisitionedRadio.addEventListener("change", (e) => {
      if (billToDistrictRequisitionedRadio.checked) {
        poCommentsInput.disabled = false;
        billToDistrictNewPORadio.checked = false;
        billToDistrictBlanketRadio.checked = false;

        updateOrderFormCustomData(
          "bill_to_option",
          billToDistrictRequisitionedRadio.value
        );
      }
    });

    billToDistrictBlanketRadio.addEventListener("change", (e) => {
      if (billToDistrictBlanketRadio.checked) {
        poCommentsInput.disabled = false;
        billToDistrictNewPORadio.checked = false;
        billToDistrictRequisitionedRadio.checked = false;

        updateOrderFormCustomData(
          "bill_to_option",
          billToDistrictBlanketRadio.value
        );
      }
    });
  }

  showPaymentContent(checkoutContent) {
    const districtInfo = checkoutContent;
    const schoolDistrict = districtInfo.customFields.find(
      (field) => field.name === "School District"
    ).value;
    const schoolDistrictAddress = districtInfo.customFields.find(
      (field) => field.name === "School District Address"
    ).value;

    const paymentInfo = `
		<div id="custom-payment-info-container">
			<label>
				<input type="radio" name="bill_to_dristrict" value="bill_to_district" >
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

    if (!this.dataRendered) {
      $(".v-custom-payment-item-wrap.active").append(paymentInfo);
      this.dataRendered = true;
      const container = document.getElementById(
        "custom-payment-info-container"
      );
      container.addEventListener("change", this.detectChanges());
    }
  }

  checkPaymentStep() {
    return window.location.hash === "#/payment";
  }

  init() {
    const _this = this;

    try {
      $(document).ajaxComplete(function () {
		const canBillDistrict = b2bCheckoutSettings.customFields.find(
      (field) => field.name === "Can Bill District"
    ).value;
        if (_this.checkPaymentStep() && !_this.dataRendered ) {
          _this.showPaymentContent(b2bCheckoutSettings);
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
