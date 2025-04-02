class UsersController < ApplicationController
  allow_unauthenticated_access only: %i[ new ]
  def new
    @user = User.new
  end

  def create
    @user = User.new(user_params)
    if @user.save
      start_new_session_for @user
      Category.seed_category_for_new_user(@user)
      SendEmailsJob.perform_later(@user, :signup)
      redirect_to categories_path, notice: "Welcome to ExpenseTracker!"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def show
    @user = Current.user
  end

  def edit
    @user = Current.user
  end

  def update
    @user = Current.user
    if validate_current_password
      @user.update(user_params.extract!(:email_address, :password, :password_confirmation))
      redirect_to root_path, notice: "Your account has been updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.expect(user: [:email_address, :current_password, :password, :password_confirmation])
  end

  def validate_current_password
    current_password = user_params.delete(:current_password)
    user = User.authenticate_by(email_address: user_params[:email_address], password: current_password)
    if user.present?
      true
    else
      @user.errors.add(:base, "Please provide valid current password to update the profile !!!")
      false
    end
  end
end
