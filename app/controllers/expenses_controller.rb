class ExpensesController < ApplicationController
  before_action :set_expense, only: %i[ show edit update destroy ]
  before_action :scoped_categories, only: %i[ new create edit update ]

  # GET /expenses or /expenses.json
  def index
    @expenses = scoped_expenses
  end

  # GET /expenses/1 or /expenses/1.json
  def show
  end

  # GET /expenses/new
  def new
    @expense = Expense.new
  end

  # GET /expenses/1/edit
  def edit
  end

  # POST /expenses or /expenses.json
  def create
    @expense = Expense.new(expense_params)

    respond_to do |format|
      if @expense.save
        ExpensesChannel.broadcast_to(
          Current.user,
          {
            action: "expense_created",
            expense: render_to_string(
              partial: "expenses/expense",
              locals: { expense: @expense },
              formats: [ :html ]
            )
          }
        )
        format.html { redirect_to expenses_path, notice: "Expense was successfully created." }
        format.json { render :show, status: :created, location: @expense }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @expense.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /expenses/1 or /expenses/1.json
  def update
    respond_to do |format|
      if @expense.update(expense_params)
        format.html { redirect_to expenses_path, notice: "Expense was successfully updated." }
        format.json { render :show, status: :ok, location: @expense }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @expense.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /expenses/1 or /expenses/1.json
  def destroy
    @expense.destroy!

    respond_to do |format|
      format.html { redirect_to expenses_path, status: :see_other, notice: "Expense was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private

    def scoped_expenses
      Expense.joins(:category)
             .where(categories: { user_id: Current.user.id })
             .order(date: :desc)
    end

    def scoped_categories
      @user_categories = Current.user.categories
    end

    # Use callbacks to share common setup or constraints between actions.
    def set_expense
      e = Expense.find(params.expect(:id))
      if e.category.user == Current.user
        @expense = e
      else
        @expense = Expense.new
        @expense.errors.add(:base, "Could not find requested expense, or it doesn't belong to the user.")
      end
    end

    # Only allow a list of trusted parameters through.
    def expense_params
      params.expect(expense: [ :amount, :description, :category_id, :date ])
    end
end
