class AddAttachmentImageToRevisions < ActiveRecord::Migration
  def self.up
    change_table :revisions do |t|
      t.attachment :image
    end
  end

  def self.down
    drop_attached_file :revisions, :image
  end
end
