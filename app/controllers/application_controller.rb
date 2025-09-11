class ApplicationController < ActionController::Base
  include Authentication
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  # Skip this check for API requests
  allow_browser versions: :modern, if: -> { request.format.html? }

  # Skip CSRF protection for JSON requests
  protect_from_forgery with: :exception, unless: -> { request.format.json? }
end
