class BackgroundValidator < ActiveModel::Validator
  def validate(record)
     if /missing/.match(record.background.url) and record.background_url == ""
       record.errors[:background] << "You must include either a background or url"
       record.errors[:background_url] << "You must include either a background or url"
     end
  end
end

class Wall < ActiveRecord::Base
  attr_accessible :header_color, :background_url, :name, :background
  has_attached_file :background, #:processors => [:auto_orient],
                    :styles => { :original => "1200x1200>" }
  has_many :revisions, :dependent => :destroy
  has_many :images, :dependent => :destroy
  belongs_to :user
  validates :name, :format => { :with => /[a-zA-Z0-9 ]+/, :message => "Only letters, numbers or spaces are allowed." }
  validates :name, :length => { :in => 4..64 }
  validates :name, :uniqueness => true
  validates_with BackgroundValidator

  def build_revision
     #build an image using the current background and all the images
    comp = nil
    #current background image
    if not /missing/.match(background.url)
      comp = get_magick_image_from_url background.url
    else
      comp = get_magick_image_from_url background_url
      if comp == nil
        errors[:background_url] = "Invalid background URL"
        return nil
      end
    end

    for image in images
      comp.composite!( get_magick_image_from_url(image.canvas.url), image.x, image.y, Magick::AtopCompositeOp )
    end

    #copy that image out to a file
    file = Tempfile.new(['comp', '.jpg'])
    comp[0].write("jpeg:"+file.path){ self.quality = 75 }

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
    begin
      urlimage = open(url)
      comp.from_blob(urlimage.read)
      return comp
    rescue Exception => e
      puts "ERROR: " + e.message
      return nil
    end
  end

  def get_last_revision
    revision = revisions.last
    unless revision
      #create new revision
      revision = build_revision
    end
    return revision
  end

  def img_url
    img_url = nil
    if revisions.last
      img_url = revisions.last.image.url
    end
    img_url
  end

  def img_square_url
    img_square_url = nil
    if (revisions.last)
      img_square_url = revisions.last.image.url(:square)
    end
    img_square_url
  end

  def is_owned_by? user
     self.user == user
  end
end
