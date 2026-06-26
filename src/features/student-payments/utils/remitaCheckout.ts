/**
 * Remita's payment finalize endpoint does not accept GET requests.
 *
 * The checkoutUrl returned by POST /billing/fee-charges/{id}/initiate-payment
 * for REMITA looks like:
 *   https://login.remita.net/remita/ecomm/finalize.reg
 *     ?merchantId=9501554396
 *     &hash=f39499b9...
 *     &RRR=131477880033
 *     &responseurl=https%3A%2F%2F...
 *
 * We parse those query params and POST them as a hidden HTML form.
 * Attempting window.location.href = checkoutUrl returns HTTP 405 from Remita.
 */
export function submitRemitaPaymentForm(checkoutUrl: string): void {
  const url = new URL(checkoutUrl);
  const formAction = url.origin + url.pathname;

  const form = document.createElement("form");
  form.method = "POST";
  form.action = formAction;

  url.searchParams.forEach((value, key) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  // console.log(
  //   "Submitting Remita form",
  //   form.action,
  //   Object.fromEntries(url.searchParams.entries())
  // );

  document.body.appendChild(form);
  form.submit();
}
