require 'rmagick'

class Wall < ActiveRecord::Base
  attr_accessible :header_color, :name, :background
  has_attached_file :background, #:processors => [:auto_orient],
                    :styles => { :original => "1200x1200>" }
  has_many :revisions, :dependent => :destroy
  has_many :images, :dependent => :destroy
  validates :name, :format => { :with => /[a-zA-Z0-9 ]+/, :message => "Only letters, numbers or spaces are allowed." }
  validates :name, :length => { :in => 4..64 }
  validates :name, :uniqueness => true
  def build_revision
     #build an image using the current background and all the images

    #current background image
    comp = get_magick_image_from_url background.url

    for image in images
      comp.composite!( get_magick_image_from_url(image.canvas.url), image.x, image.y, Magick::AtopCompositeOp )
    end

    #copy that image out to a file
    file = Tempfile.new(['comp', '.jpg'])
    comp[0].write("jpeg:"+file.path){ self.quality = 50 }

    #create revision
    rev = Revision.new
    rev.image = file
    rev.wall = self

    rev.save
    file.delete

    return rev
  end
  def get_magick_image_from_url url
    if url.match(/^\/system/)
      url = "http://localhost:3000#{url.split('?')[0]}"
    end
    comp = Magick::ImageList.new
    urlimage = open(url)
    comp.from_blob(urlimage.read)
    return comp
  end

  def get_last_revision
    revision = revisions.last
    unless revision
      #create new revision
      revision = build_revision
    end
    return revision
  end
end
