const COURIER_STATUS_MAP = {
	Pending: "În așteptare",
	Shipped: "Expediată",
	Delivered: "Livrată",
	Cancelled: "Anulată",
};

const PICKUP_STATUS_MAP = {
	Pending: "În așteptare",
	Shipped: "Gata de ridicare",
	Delivered: "Ridicată",
	Cancelled: "Anulată",
};

export const getDeliveryMethodLabel = (deliveryMethod) => {
	if (deliveryMethod === "pickup") return "Ridicare din magazin";
	return "Livrare prin curier";
};

export const getPaymentMethodLabel = (paymentMethod, deliveryMethod = "courier") => {
	if (paymentMethod === "card") return "Card online";
	if (deliveryMethod === "pickup") return "Plată la ridicare";
	return "Plată la livrare";
};

export const getOrderStatusLabel = (status, deliveryMethod = "courier") => {
	const map = deliveryMethod === "pickup" ? PICKUP_STATUS_MAP : COURIER_STATUS_MAP;
	return map[status] || status;
};

export const getOrderStatusOptions = (deliveryMethod = "courier") => {
	const map = deliveryMethod === "pickup" ? PICKUP_STATUS_MAP : COURIER_STATUS_MAP;
	return Object.entries(map);
};

export const getOrderStatusClass = (status) => {
	switch (status) {
		case "Pending":
			return "bg-yellow-100 text-yellow-800";
		case "Shipped":
			return "bg-blue-100 text-blue-800";
		case "Delivered":
			return "bg-green-100 text-green-800";
		case "Cancelled":
			return "bg-gray-100 text-gray-800";
		default:
			return "bg-gray-100 text-gray-800";
	}
};

export const FILTER_STATUS_OPTIONS = [
	["Pending", "În așteptare"],
	["Shipped", "Expediată / Gata de ridicare"],
	["Delivered", "Livrată / Ridicată"],
	["Cancelled", "Anulată"],
];
