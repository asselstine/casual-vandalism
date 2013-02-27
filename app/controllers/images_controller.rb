class ImagesController < ApplicationController

  # GET /images
  # GET /images.json
  def index
    @images = Image.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @images }
    end
  end

  #DELETE /images
  def delete_all

    for image in Image.all
      image.canvas.destroy
      image.delete
    end
    @images = []
    redirect_to '/'
  end

  # GET /images/1
  # GET /images/1.json
  def show
    @image = Image.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @image }
    end
  end

  # GET /images/new
  # GET /images/new.json
  def new
    @image = Image.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @image }
    end
  end

  # GET /images/1/edit
  def edit
    @image = Image.find(params[:id])
  end

  # POST /images
  # POST /images.json
  def create
    @wall = Wall.find(params[:wall_id])
    @image = Image.new(params[:image])
    file = Tempfile.new(['blah', '.png'])
    if params[:canvas_data]
      file.binmode
      file.write (Base64.decode64(params[:canvas_data]))
    elsif params[:draw_list]
      gc = Magick::Draw.new
      gc.stroke_linecap("round")
      gc.stroke_linejoin("round")
      last_cmd = nil
      params[:draw_list].each_with_index do |val, i|
        cmd = DrawCmd.new(val)
        gc.stroke(cmd.color)
        gc.stroke_width( cmd.width )
        if !cmd.is_drag #if it's a new line
          gc.line(cmd.x - 1, cmd.y - 1, cmd.x, cmd.y)
        else
          gc.line(last_cmd.x, last_cmd.y, cmd.x, cmd.y)
        end
        last_cmd = cmd
      end
      img = Magick::Image.new( [ Integer(params[:w]), 1200].min , [ Integer(params[:h]), 1200 ].min )
      img.alpha(Magick::TransparentAlphaChannel)
      gc.draw(img)
      img.write("png:"+file.path)
    end
    @image.canvas = file
    @image.wall = @wall
    @wall.images<<@image
    respond_to do |format|
      if @image.save and @wall.build_revision(@image)
        format.html { redirect_to @image, notice: 'Image was successfully created.' }
        format.json { render json: { :image => @image, :background_url => @wall.revisions.last.image.url }, status: :created, location: @image }
      else
        format.html { render action: "new" }
        format.json { render json: @image.errors, status: :unprocessable_entity }
      end
    end
    file.delete
  end

  # PUT /images/1
  # PUT /images/1.json
  def update
    @image = Image.find(params[:id])

    respond_to do |format|
      if @image.update_attributes(params[:image])
        format.html { redirect_to @image, notice: 'Image was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @image.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /images/1
  # DELETE /images/1.json
  def destroy
    @image = Image.find(params[:id])
    @image.destroy

    respond_to do |format|
      format.html { redirect_to images_url }
      format.json { head :no_content }
    end
  end
end

class DrawCmd
  attr_accessor :x, :y, :is_drag, :color, :width
  def initialize(string)
    arr = string.split('&')
    self.x = Integer(arr[0])
    self.y = Integer(arr[1])
    self.is_drag = arr[2].to_bool
    self.color = arr[3]
    self.width = Integer(arr[4])
  end
end