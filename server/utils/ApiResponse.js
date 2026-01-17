
//  ApiResponse.js
class ApiResponse {
  constructor({
    success = true,
    message = "Success",
    data = null,
    meta = null,
  }) {
    this.success = success;
    this.message = message;
    if (data !== null) this.data = data;
    if (meta !== null) this.meta = meta;
  }
}

export default ApiResponse;
