module ImagesHelper

  def self.canvas_data_to_file(canvas_data)
    file = Tempfile.new(['blah', '.png'])
    file.binmode
    file.write (Base64.decode64(params[:canvas_data]))
    file
  end

end
