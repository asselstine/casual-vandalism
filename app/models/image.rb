class Image < ActiveRecord::Base
  WIDTH_MAX = 1200
  HEIGHT_MAX = 1200

  after_save :build_canvas_from_draw_list

  # attr_accessible :title, :body
  attr_accessible :x, :y, :w, :h, :canvas, :draw_list
  attr_accessor :draw_list
  validates_presence_of :draw_list
  has_attached_file :canvas
  belongs_to :wall, :touch => true

  def build_canvas_from_draw_list
    file = Tempfile.new(['blah', '.png'])
    gc = Magick::Draw.new
    gc.stroke_linecap("round")
    gc.stroke_linejoin("round")
    last_cmd = nil
    max_x = 0
    max_y = 0
    max_width = 0
    draw_list.each_with_index do |val, i|
      cmd = DrawCmd.new(val)
      max_x = [max_x, cmd.x].max
      max_y = [max_y, cmd.y].max
      max_width = [max_width, cmd.width].max
      gc.stroke(cmd.color)
      gc.stroke_width( cmd.width )
      if !cmd.is_drag #if it's a new line
        gc.line(cmd.x - 1, cmd.y - 1, cmd.x, cmd.y)
      else
        gc.line(last_cmd.x, last_cmd.y, cmd.x, cmd.y)
      end
      last_cmd = cmd
    end
    img = Magick::Image.new( [ Integer(max_x + max_width), WIDTH_MAX].min , [ Integer(max_y + max_width), HEIGHT_MAX ].min )
    img.alpha(Magick::TransparentAlphaChannel)
    gc.draw(img)
    img.write("png:"+file.path)
    self.canvas = file
    self.canvas.save
  end
end


class DrawCmd
  SPLIT_CHAR = '&'
  attr_accessor :x, :y, :is_drag, :color, :width
  def initialize(string)
    arr = string.split(SPLIT_CHAR)
    self.x = Integer(arr[0])
    self.y = Integer(arr[1])
    self.is_drag = arr[2].to_bool
    self.color = arr[3]
    self.width = Integer(arr[4])
  end
end