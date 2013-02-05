class WallsController < ApplicationController
  # GET /walls
  # GET /walls.json
  def index
    @walls = Wall.all
    for wall in @walls
      wall.get_last_revision
    end
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @walls }
    end
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
    @revision = @wall.get_last_revision
    render "show"
  end

  # GET /walls/1
  # GET /walls/1.json
  def show
    @wall = Wall.find(params[:id])
    @revision = @wall.get_last_revision
    respond_to do |format|
      format.html # show.html.erb
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
  end

  # POST /walls
  # POST /walls.json
  def create
    @wall = Wall.new(params[:wall])

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

    respond_to do |format|
      if @wall.update_attributes(params[:wall])
        format.html { redirect_to @wall, notice: 'Wall was successfully updated.' }
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
    @wall.destroy

    respond_to do |format|
      format.html { redirect_to walls_url }
      format.json { head :no_content }
    end
  end
end