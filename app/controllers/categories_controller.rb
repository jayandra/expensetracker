class CategoriesController < ApplicationController
  before_action :set_category, only: %i[ show edit update destroy ]
  before_action :scoped_categories, only: %i[ new create edit update ]

  # GET /categories or /categories.json
  def index
    @root_categories = scoped_categories.roots
  end

  # GET /categories/1 or /categories/1.json
  def show
  end

  # GET /categories/new
  def new
    @category = Category.new
  end

  # GET /categories/1/edit
  def edit
  end

  # POST /categories or /categories.json
  def create
    @category = Current.user.categories.new(category_params)

    respond_to do |format|
      if @category.save
        format.html { redirect_to categories_path, notice: "Category was successfully created." }
        format.json { render :show, status: :created, location: @category }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @category.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /categories/1 or /categories/1.json
  def update
    respond_to do |format|
      if @category.update(category_params)
        format.html { redirect_to categories_path, notice: "Category was successfully updated." }
        format.json { render :show, status: :ok, location: @category }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @category.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /categories/1 or /categories/1.json
  def destroy
    @category.destroy!

    respond_to do |format|
      format.html { redirect_to categories_path, status: :see_other, notice: "Category was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  # POST /update_position
  def update_position
    if Category.find(update_position_params[:ids]).pluck(:user_id).uniq == [ Current.user.id ]
      new_order = update_position_params[:ids].zip(update_position_params[:positions]).reduce([]) { |h, a| h << { id: a.first, position: a.last } }
      Category.upsert_all(new_order, unique_by: :id)

      head :ok
    else
      head :bad_request
    end
  end

  private
    def scoped_categories
      @user_categories = Current.user.categories
    end
    # Use callbacks to share common setup or constraints between actions.
    def set_category
      @category = scoped_categories.find_by(id: params.expect(:id))
      if @category.nil?
        @category = Category.new
        @category.errors.add(:base, "Could not find requested category, or it doesn't belong to the user.")
      end
    end

    # Only allow a list of trusted parameters through.
    def category_params
      params.expect(category: [ :name, :parent_id ])
    end

    def update_position_params
      params.expect(categories: [ ids: [], positions: [] ])
    end
end
