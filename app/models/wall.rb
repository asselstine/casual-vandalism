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

  def download_url_as_background(url)
    # Download that url to a local file, then set it as the background
    tempfile = Tempfile.new('comp')
    tempfile.binmode
    tempfile.write open(url).read
    self.background = tempfile
  end

  #builds a revision using the background image.
  def rebuild_revision
    if images.length > 0
      comp = get_imagelist_from_url background.url
      for image in images
        comp.composite!( get_imagelist_from_url(image.canvas.url), image.x, image.y, Magick::AtopCompositeOp )
      end
      return new_revision_with_imagelist(comp)
    else
      rev = Revision.new
      rev.image = background
      rev.wall = self
      rev.save
      return rev
    end
  end

  #builds a new revision which layers the image on top of the old revision image.
  def build_revision(image)
    if revisions.last
      comp = get_imagelist_from_url revisions.last.image.url
    else
      comp = get_imagelist_from_url background.url
    end
    comp.composite!( get_imagelist_from_url(image.canvas.url), image.x, image.y, Magick::AtopCompositeOp )
    return new_revision_with_imagelist(comp)
  end

  def new_revision_with_imagelist(imagelist)
    #copy that image out to a file
    file = Tempfile.new(['comp', '.png'])
    imagelist[0].write("png:"+file.path)

    #create revision
    rev = Revision.new
    rev.image = file
    rev.wall = self

    rev.save
    file.delete

    return rev
  end

  def get_imagelist_from_url url
    if url.match(/^\/system/)
      url = "http://localhost:3000#{url.split('?')[0]}"
    end
    comp = Magick::ImageList.new
    urlimage = open(url)
    comp.from_blob(urlimage.read)
    return comp
  end

  def img_url
    img_url = nil
    if revisions.last
      img_url = revisions.last.image.url
    else
      img_url = background.url
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
