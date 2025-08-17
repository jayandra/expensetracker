class SessionsController < ApplicationController
  skip_before_action :verify_authenticity_token, if: -> { request.format.json? }
  allow_unauthenticated_access only: %i[new create show]
  rate_limit to: 10, within: 3.minutes, only: :create, with: -> { handle_rate_limit }

  def new
  end

  def show
    # Probe current session for SPA
    if authenticated?
      render json: { user: Current.user.as_json(only: [ :id, :email_address ]), logged_in: true }
    else
      render json: { logged_in: false }, status: :unauthorized
    end
  end

  def create
    @user = User.authenticate_by(session_params)

    respond_to do |format|
      if @user
        start_new_session_for @user

        format.html { redirect_to after_authentication_url }
        format.json { render json: { user: @user, status: :created, logged_in: true } }
      else
        @errors = User.new.errors
        @errors.add(:base, "Try another email address or password")

        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: { errors: @errors.full_messages }, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    terminate_session

    respond_to do |format|
      format.html { redirect_to new_session_path }
      format.json { head :no_content }
    end
  end

  private

  def session_params
    params.permit(:email_address, :password, :password_confirmation)
  end

  def handle_rate_limit
    respond_to do |format|
      format.html { redirect_to new_session_url, alert: "Try again later." }
      format.json { render json: { error: "Too many requests. Please try again later." }, status: :too_many_requests }
    end
  end
end
