class WallsController < ApplicationController

  before_filter :authenticate_user!, :only => [ :new, :edit, :create, :update, :destroy ]

  # GET /walls
  # GET /walls.json
  def index
    @walls = Wall.order("updated_at DESC").all
    @current_user = current_user
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @walls }
    end
  end

  def clear
    @wall = Wall.find(params[:id])
    unless @wall.is_owned_by? current_user
      redirect_to "index", notice: "You are not allowed to edit this wall."
      return
    end
    @wall.images.delete_all
    @wall.rebuild_revision
    render 'edit'
  end

  def qrcode
    @wall = Wall.find(params[:id])
    @size = 4
    render 'qrcode', :layout => "qrcode_list"
  end

  def show_by_name
    name = params[:wall_name].gsub('_', ' ')
    @wall = Wall.find_by_name name
    unless @wall
      flash[:notice] = "There is no wall with that name"
      @walls = Wall.all
      render 'index'
      return
    end
    render "show"
  end

  # GET /walls/1
  # GET /walls/1.json
  def show
    @wall = Wall.find(params[:id])
    respond_to do |format|
      format.html { render "show", :layout => "drawing" }
      format.json { render json: @wall }
    end
  end

  # GET /walls/new
  # GET /walls/new.json
  def new
    @wall = Wall.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @wall }
    end
  end

  # GET /walls/1/edit
  def edit
    @wall = Wall.find(params[:id])
    unless @wall.is_owned_by? current_user
      redirect_to "index", notice: "You are not allowed to edit this wall."
      return
    end
  end

  # POST /walls
  # POST /walls.json
  def create
    @wall = Wall.new(params[:wall])
    @wall.user = current_user
    respond_to do |format|
      if @wall.save
        format.html { redirect_to @wall, notice: 'Wall was successfully created.' }
        format.json { render json: @wall, status: :created, location: @wall }
      else
        format.html { render action: "new" }
        format.json { render json: @wall.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /walls/1
  # PUT /walls/1.json
  def update

    @wall = Wall.find(params[:id])

    unless @wall.is_owned_by? current_user
      redirect_to "index", notice: "You are not allowed to edit this wall."
      return
    end

    respond_to do |format|
      if @wall.update_attributes(params[:wall]) and @wall.rebuild_revision
        format.html { redirect_to walls_path, notice: 'Wall was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @wall.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /walls/1
  # DELETE /walls/1.json
  def destroy
    @wall = Wall.find(params[:id])
    if @wall.is_owned_by? current_user
      @wall.destroy
      respond_to do |format|
        format.html { redirect_to walls_url }
        format.json { head :no_content }
      end
    else
      redirect_to "index", notice: "You are not allowed to destroy this wall."
    end
  end
end
