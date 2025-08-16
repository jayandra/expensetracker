class PasswordsController < ApplicationController
  allow_unauthenticated_access
  before_action :set_user_by_token, only: %i[ edit update ]

  def new
  end

  def create
    if user = User.find_by(email_address: params[:email_address])
      if ENV["DISABLE_ASYNC_JOBS"] == true || Rails.application.credentials.disable_async_jobs == true
        PasswordsMailer.reset(user).deliver_now
      else
        SendEmailsJob.perform_later(user, :password_reset)
      end
    end

    respond_to do |format|
      format.json { head :ok }
      format.html { redirect_to new_session_path, notice: "Password reset instructions sent (if user with that email address exists)." }
    end
  end

  def edit
  end

  def update
    if @user.update(params.permit(:password, :password_confirmation))
      respond_to do |format|
        format.json { render json: { message: "Password has been reset." } }
        format.html { redirect_to new_session_path, notice: "Password has been reset." }
      end
    else
      respond_to do |format|
        format.json { render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity }
        format.html { render :edit, status: :unprocessable_entity }
      end
    end
  end

  private
    def set_user_by_token
      @user = User.find_by_password_reset_token!(params[:token])
    rescue ActiveSupport::MessageVerifier::InvalidSignature
      redirect_to new_password_path, alert: "Password reset link is invalid or has expired."
    end
end
