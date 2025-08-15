class ApplicationController < ActionController::Base
  include Authentication
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  # Skip CSRF protection for JSON requests
  protect_from_forgery with: :exception, unless: -> { request.format.json? }
end
